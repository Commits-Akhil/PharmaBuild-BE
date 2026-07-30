/**
 * authorizeRoles(...allowedRoles) → middleware
 * Role-based access control factory. Call with one or more allowed role strings.
 * Must be used AFTER verifyToken so req.user is already populated.
 * Returns 401 if req.user is missing, 403 if the user's role is not in allowedRoles.
 *
 * Usage: router.use(verifyToken, authorizeRoles('admin', 'pharmacist'))
 */
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });

  if (!allowedRoles.includes(req.user.role))
    return res.status(403).json({ success: false, message: `Access denied. Required role(s): ${allowedRoles.join(', ')}.` });

  next();
};

module.exports = authorizeRoles;
