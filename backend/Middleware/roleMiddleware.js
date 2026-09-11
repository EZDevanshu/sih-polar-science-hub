const { error } = require('../Utilities/responseFormatter');

/**
 * Role-based Authorization Guard Middleware
 * @param {string|string[]} allowedRoles Array of allowed role strings e.g. ['Admin', 'Researcher']
 */
function requireRole(...allowedRoles) {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required to access this resource.', 401);
    }

    const userRole = req.user.role || 'User';
    const hasPermission = roles.includes(userRole) || userRole === 'Admin'; // Admin has full access

    if (!hasPermission) {
      return error(
        res,
        `Forbidden. Your role '${userRole}' does not have permission to access this resource. Required: [${roles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

module.exports = {
  requireRole
};
