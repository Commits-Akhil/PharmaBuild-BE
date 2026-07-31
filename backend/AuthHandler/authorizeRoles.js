
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });

  if (!allowedRoles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Access denied. Required role(s): ${allowedRoles.join(', ')}.` });

  next();
};

module.exports = authorizeRoles;
