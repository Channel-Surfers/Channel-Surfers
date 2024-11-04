import type { Role } from '$lib/server/db/roles.sql';

/**
 * Represents the summation of a user's permissions
 */
export type Permissions = Omit<Role, 'id' | 'channelId' | 'title' | 'isOwner' | 'ranking'>;
/**
 * Converts `Role` to `Permissions`
 */
const roleToPermissions = (role: Role): Permissions => {
    return role;
};
/**
 * Reduces an array of Roles into one set of permissions in the form of `Permissions`
 */
export const sumPermissions = (roles: Role[]): Permissions =>
    roles.map(roleToPermissions).reduce(objectBooleanSum);

/**
 * Performs an OR operation across all properties of object type `T`
 */
export const objectBooleanSum = <T extends Record<string, boolean>>(first: T, second: T): T => {
    return Object.keys(first).reduce((acc, key) => {
        acc[key as keyof T] = first[key as keyof T] || second[key as keyof T];
        return acc;
    }, {} as T);
};

/**
 * Represents roles relating to role management permissions
 */
export type RoleMgmtPermissions = Pick<
    Role,
    'canCreateRoles' | 'canViewRoles' | 'canEditRoles' | 'canDeleteRoles' | 'canAssignRoles'
>;
/**
 * Create role management permissions with defaults
 */
export const roleMgmtPermissions = (
    permissions: Partial<RoleMgmtPermissions>
): RoleMgmtPermissions => ({
    ...permissions,
    ...{
        canCreateRoles: false,
        canViewRoles: false,
        canEditRoles: false,
        canDeleteRoles: false,
        canAssignRoles: false,
    },
});
