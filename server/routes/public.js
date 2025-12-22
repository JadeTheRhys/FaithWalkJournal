const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { checkContent, sanitizeContent, MAX_CONTENT_LENGTH } = require('../utils/wordFilter');

/**
 * POST /api/posts - Submit an anonymous post
 */
router.post('/posts', (req, res) => {
  try {
    const { content } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` });
    }

    // Sanitize content
    const sanitized = sanitizeContent(content);

    // Check for inappropriate words
    const filterResult = checkContent(sanitized);
    
    let approvalStatus = 'pending';
    let flaggedWords = null;

    if (filterResult.highestSeverity === 'high') {
      // Auto-reject posts with high severity words
      approvalStatus = 'rejected';
      flaggedWords = filterResult.flaggedWords.join(', ');
      
      // Still save to database for moderation log
      const stmt = db.prepare(
        'INSERT INTO posts (content, approval_status, flagged_words) VALUES (?, ?, ?)'
      );
      stmt.run(sanitized, approvalStatus, flaggedWords);
      
      return res.status(200).json({
        success: true,
        message: 'Your submission has been received but contains content that violates community guidelines.',
        status: 'rejected'
      });
    } else if (!filterResult.isClean) {
      // Flag for review but don't auto-reject
      flaggedWords = filterResult.flaggedWords.join(', ');
    }

    // Insert post
    const stmt = db.prepare(
      'INSERT INTO posts (content, approval_status, flagged_words) VALUES (?, ?, ?)'
    );
    const result = stmt.run(sanitized, approvalStatus, flaggedWords);

    res.status(201).json({
      success: true,
      message: 'Your submission has been sent for moderation. It will appear in the community feed once approved.',
      status: approvalStatus,
      postId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error submitting post:', error);
    res.status(500).json({ error: 'Failed to submit post' });
  }
});

/**
 * GET /api/posts - Get approved posts
 */
router.get('/posts', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const posts = db.prepare(`
      SELECT id, content, timestamp
      FROM posts
      WHERE approval_status = 'approved'
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE approval_status = 'approved'
    `).get();

    res.json({
      success: true,
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        timestamp: post.timestamp
      })),
      total: total.count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;
