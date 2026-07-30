const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * verifyToken middleware
 * Reads the Bearer token from the Authorization header, verifies it
 * against JWT_SECRET, and attaches the decoded payload { id, email, role }
 * to req.user so downstream handlers can access the caller's identity.
 * Returns 401 if the header is missing or the token is invalid/expired.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
