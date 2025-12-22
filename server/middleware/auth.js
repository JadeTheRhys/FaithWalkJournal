const jwt = require('jsonwebtoken');

// In production, use environment variable for secret
const JWT_SECRET = process.env.JWT_SECRET || 'faithwalk-jwt-secret-change-in-production';
const JWT_EXPIRY = '8h';

/**
 * Middleware to verify JWT tokens for admin routes
 */
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Generate JWT token for admin user
 */
function generateToken(username) {
  return jwt.sign(
    { username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

module.exports = {
  authenticateAdmin,
  generateToken,
  JWT_SECRET
};
