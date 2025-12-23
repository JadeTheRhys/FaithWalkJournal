const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authenticateAdmin, generateToken, verifyAndDecodeToken } = require('../middleware/auth');

/**
 * POST /api/admin/login - Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(username);

    res.json({
      success: true,
      token,
      username: user.username
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/admin/refresh-token - Refresh JWT token
 */
router.post('/refresh-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token required', tokenExpired: true });
    }

    const oldToken = authHeader.substring(7);
    const decoded = verifyAndDecodeToken(oldToken);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token', tokenExpired: true });
    }

    // Verify user still exists
    const user = db.prepare('SELECT username FROM admin_users WHERE username = ?').get(decoded.username);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found', tokenExpired: true });
    }

    // Generate new token
    const newToken = generateToken(decoded.username);

    res.json({
      success: true,
      token: newToken,
      username: decoded.username
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * GET /api/admin/posts - Get posts for moderation
 */
router.get('/posts', authenticateAdmin, (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const posts = db.prepare(`
      SELECT id, content, timestamp, approval_status, flagged_words, created_at
      FROM posts
      WHERE approval_status = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(status, limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE approval_status = ?
    `).get(status);

    res.json({
      success: true,
      posts,
      total: total.count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

/**
 * PUT /api/admin/posts/:id - Approve or reject a post
 */
router.put('/posts/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    const approvalStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update post status
    const stmt = db.prepare('UPDATE posts SET approval_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(approvalStatus, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Log moderation action
    db.prepare(
      'INSERT INTO moderation_log (post_id, action, admin_username, reason) VALUES (?, ?, ?, ?)'
    ).run(id, action, req.admin.username, reason || null);

    res.json({
      success: true,
      message: `Post ${action}d successfully`,
      postId: id,
      status: approvalStatus
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

/**
 * DELETE /api/admin/posts/:id - Delete a post
 */
router.delete('/posts/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Log deletion before deleting (cascade will delete log too)
    db.prepare(
      'INSERT INTO moderation_log (post_id, action, admin_username, reason) VALUES (?, ?, ?, ?)'
    ).run(id, 'delete', req.admin.username, reason || 'Deleted by admin');

    // Delete post
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
      postId: id
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * GET /api/admin/filters - Get word filters
 */
router.get('/filters', authenticateAdmin, (req, res) => {
  try {
    const filters = db.prepare('SELECT * FROM word_filters ORDER BY severity DESC, word ASC').all();

    res.json({
      success: true,
      filters
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

/**
 * POST /api/admin/filters - Add word filter
 */
router.post('/filters', authenticateAdmin, (req, res) => {
  try {
    const { word, severity } = req.body;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: 'Word is required' });
    }

    if (!['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({ error: 'Severity must be low, medium, or high' });
    }

    const stmt = db.prepare('INSERT INTO word_filters (word, severity) VALUES (?, ?)');
    try {
      const result = stmt.run(word.toLowerCase().trim(), severity);
      res.status(201).json({
        success: true,
        message: 'Filter added successfully',
        filterId: result.lastInsertRowid
      });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'This word already exists in the filter list' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error adding filter:', error);
    res.status(500).json({ error: 'Failed to add filter' });
  }
});

/**
 * DELETE /api/admin/filters/:id - Delete word filter
 */
router.delete('/filters/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM word_filters WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    res.json({
      success: true,
      message: 'Filter deleted successfully',
      filterId: id
    });
  } catch (error) {
    console.error('Error deleting filter:', error);
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

/**
 * GET /api/admin/stats - Get moderation statistics
 */
router.get('/stats', authenticateAdmin, (req, res) => {
  try {
    const stats = {
      pending: db.prepare('SELECT COUNT(*) as count FROM posts WHERE approval_status = ?').get('pending').count,
      approved: db.prepare('SELECT COUNT(*) as count FROM posts WHERE approval_status = ?').get('approved').count,
      rejected: db.prepare('SELECT COUNT(*) as count FROM posts WHERE approval_status = ?').get('rejected').count,
      total: db.prepare('SELECT COUNT(*) as count FROM posts').get().count,
      recentActions: db.prepare('SELECT * FROM moderation_log ORDER BY timestamp DESC LIMIT 10').all()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * PUT /api/admin/change-password - Change admin password
 */
router.put('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get current user
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(req.admin.username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(newHash, req.admin.username);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
