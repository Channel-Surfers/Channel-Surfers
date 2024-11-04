import type { Role } from '$lib/server/db/roles.sql';

/**
 * Represents the summation of a user's permissions
 */
export type Permissions = Omit<Role, 'id' | 'channelId' | 'title' | 'isOwner' | 'ranking'>;
/**
 * Converts `Role` to `Permissions`
 */
const roleToPermissions = (role: Role | Permissions): Permissions => {
    return role;
};
/**
 * Reduces an array of Roles into one set of permissions in the form of `Permissions`
 */
export const sumPermissions = (roles: Role[] | Permissions[]): Permissions =>
    roles.map(roleToPermissions).reduce(objectBooleanSum);

/**
 * Performs an OR operation across all properties of object type `T`
 *
 * Naturally satisfies commutativity and associativity that OR has.
 */
export const objectBooleanSum = <T extends Record<string, boolean>>(first: T, second: T): T => {
    return Object.keys(first).reduce((acc, key) => {
        acc[key as keyof T] = first[key as keyof T] || second[key as keyof T];
        return acc;
    }, {} as T);
};

/**
 * Represents permissions relating to role management
 */
export type RoleMgmtPermissions = Pick<
    Role,
    'canCreateRoles' | 'canViewRoles' | 'canEditRoles' | 'canDeleteRoles' | 'canAssignRoles'
>;
/**
 * Create role management permissions with defaults
 */
export const roleMgmtPermissions = (
    permissions: Partial<RoleMgmtPermissions> = {}
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

/**
 * Represents permissions relating to channel management
 */
export type ChannelMgmtPermissions = Pick<
    Role,
    'canSetMessageOfTheDay' | 'canEditName' | 'canSetImage' | 'canViewUserTable' | 'canEditTags'
>;

/**
 * Create channel management permissions with defaults
 */
export const channelMgmtPermissions = (
    permissions: Partial<ChannelMgmtPermissions> = {}
): ChannelMgmtPermissions => ({
    ...permissions,
    ...{
        canSetMessageOfTheDay: false,
        canEditName: false,
        canSetImage: false,
        canViewUserTable: false,
        canEditTags: false,
    },
});

/**
 * Represents permissions relating to channel moderation
 */
export type ChannelModPermissions = Pick<
    Role,
    | 'canSetGuidelines'
    | 'canTimeoutUsers'
    | 'canBanUsers'
    | 'canViewBannedUsers'
    | 'canUnbanUsers'
    | 'canDeletePosts'
    | 'canDeleteComments'
    | 'canEditPostTags'
    | 'canViewReports'
    | 'canUpdateReports'
    | 'canResolveReports'
>;

/**
 * Create channel moderation permissions with defaults
 */
export const channelModPermissions = (
    permissions: Partial<ChannelModPermissions> = {}
): ChannelModPermissions => ({
    ...permissions,
    ...{
        canSetGuidelines: false,
        canTimeoutUsers: false,
        canBanUsers: false,
        canViewBannedUsers: false,
        canUnbanUsers: false,
        canDeletePosts: false,
        canDeleteComments: false,
        canEditPostTags: false,
        canViewReports: false,
        canUpdateReports: false,
        canResolveReports: false,
    },
});

/**
 * Represents permissions relating to event management
 */
export type EventMgmtPermissions = Pick<
    Role,
    'canRegisterEvents' | 'canViewEvents' | 'canEditEvents' | 'canUnregisterEvents'
>;

/**
 * Create event managment permissions with defaults
 */
export const eventMgmtPermissions = (
    permissions: Partial<EventMgmtPermissions> = {}
): EventMgmtPermissions => ({
    ...permissions,
    ...{
        canRegisterEvents: false,
        canViewEvents: false,
        canEditEvents: false,
        canUnregisterEvents: false,
    },
});
