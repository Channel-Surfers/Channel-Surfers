import type { Role } from '$lib/server/db/roles.sql';

/**
 * Represents roles relating to role management permissions
 */
export type RoleMgmtPermissions = Pick<
    Role,
    'canCreateRoles' | 'canViewRoles' | 'canEditRoles' | 'canDeleteRoles' | 'canAssignRoles'
>;
/**
 * Define a type
 */
export const roleMgmtPermissions = (
    permissions: Partial<RoleMgmtPermissions>
): Partial<RoleMgmtPermissions> => permissions;
