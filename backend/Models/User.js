/**
 * User Model Schema & Roles
 */

const UserRoles = {
  ADMIN: 'Admin',
  RESEARCHER: 'Researcher',
  REVIEWER: 'Reviewer',
  USER: 'User'
};

function formatUserResponse(user) {
  if (!user) return null;
  const { password_hash, refresh_tokens, ...safeUser } = user;
  return {
    id: safeUser._id ? safeUser._id.toString() : safeUser.id,
    email: safeUser.email,
    name: safeUser.name,
    role: safeUser.role || UserRoles.USER,
    institution: safeUser.institution || '',
    designation: safeUser.designation || '',
    created_at: safeUser.created_at || new Date().toISOString(),
    updated_at: safeUser.updated_at || new Date().toISOString()
  };
}

module.exports = {
  UserRoles,
  formatUserResponse
};
