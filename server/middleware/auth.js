const jwt = require('jsonwebtoken');

// JWT secret - must be set in production
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('WARNING: Using default JWT secret for development. Set JWT_SECRET in production!');
  return 'faithwalk-jwt-secret-change-in-production';
})();
const JWT_EXPIRY = '8h';
const JWT_REFRESH_THRESHOLD = 30 * 60; // 30 minutes in seconds

/**
 * Middleware to verify JWT tokens for admin routes
 * Also checks if token is close to expiring and signals for refresh
 */
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required', tokenExpired: true });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    
    // Check if token is close to expiring
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    
    if (timeUntilExpiry < JWT_REFRESH_THRESHOLD) {
      // Signal that token should be refreshed
      res.setHeader('X-Token-Refresh-Needed', 'true');
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token', tokenExpired: true });
    }
    return res.status(401).json({ error: 'Invalid or expired token', tokenExpired: true });
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

/**
 * Verify and refresh an existing token
 */
function verifyAndDecodeToken(token) {
  try {
    // Use verify with ignoreExpiration to allow refresh of recently expired tokens
    // but still validate signature and structure
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    
    // Check if token is not too old to refresh (max 24 hours past expiration)
    const now = Math.floor(Date.now() / 1000);
    const maxRefreshAge = 24 * 60 * 60; // 24 hours in seconds
    
    if (decoded.exp && (now - decoded.exp) > maxRefreshAge) {
      console.warn('Token refresh rejected: token too old');
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Log security-relevant errors
    if (error.name === 'JsonWebTokenError') {
      console.error('Token verification failed: Invalid token structure or signature');
    } else if (error.name !== 'TokenExpiredError') {
      console.error('Token verification error:', error.message);
    }
    return null;
  }
}

module.exports = {
  authenticateAdmin,
  generateToken,
  verifyAndDecodeToken,
  JWT_SECRET
};
