const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Configuration/jwtConfig');
const { error } = require('../Utilities/responseFormatter');

/**
 * Authentication Middleware: Verifies Bearer JWT Token in Authorization header.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return error(res, 'Access denied. No authentication token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Authentication token has expired. Please refresh your token.', 401, { expired: true });
    }
    return error(res, 'Invalid authentication token.', 403);
  }
}

/**
 * Optional Authentication: Attaches req.user if token is valid, otherwise proceeds without error.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid token in optional mode
    }
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth
};
