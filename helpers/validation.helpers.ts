/**
 * Role-check helpers. Schema has UserRole: ADMIN, USER.
 */

export function isAdminRole(role: unknown) {
  return role === 'ADMIN' || role === 'admin';
}
