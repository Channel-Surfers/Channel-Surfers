import type { Role } from '$lib/server/db/roles.sql';

/**
 * Represents the summation of a user's permissions
 */
export type Permissions = Omit<Role, 'id' | 'channelId' | 'title' | 'isOwner' | 'ranking'>;
/**
 * Converts `Role` to `Permissions`
 */
export const roleToPermissions = (role: Role | Permissions): Permissions => {
    return {
        canCreateRoles: role.canCreateRoles,
        canViewRoles: role.canViewRoles,
        canEditRoles: role.canEditRoles,
        canDeleteRoles: role.canDeleteRoles,
        canAssignRoles: role.canAssignRoles,
        canSetMessageOfTheDay: role.canSetMessageOfTheDay,
        canEditName: role.canEditName,
        canSetImage: role.canSetImage,
        canViewUserTable: role.canViewUserTable,
        canEditTags: role.canEditTags,
        canSetGuidelines: role.canSetGuidelines,
        canTimeoutUsers: role.canTimeoutUsers,
        canBanUsers: role.canBanUsers,
        canViewBannedUsers: role.canViewBannedUsers,
        canUnbanUsers: role.canUnbanUsers,
        canDeletePosts: role.canDeletePosts,
        canDeleteComments: role.canDeleteComments,
        canEditPostTags: role.canEditPostTags,
        canViewReports: role.canViewReports,
        canUpdateReports: role.canUpdateReports,
        canResolveReports: role.canResolveReports,
        canRegisterEvents: role.canRegisterEvents,
        canViewEvents: role.canViewEvents,
        canEditEvents: role.canEditEvents,
        canUnregisterEvents: role.canUnregisterEvents,
    };
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
    permissions: Partial<RoleMgmtPermissions> | 'all' = {}
): RoleMgmtPermissions =>
    permissions === 'all'
        ? {
              canCreateRoles: true,
              canViewRoles: true,
              canEditRoles: true,
              canDeleteRoles: true,
              canAssignRoles: true,
          }
        : {
              ...{
                  canCreateRoles: false,
                  canViewRoles: false,
                  canEditRoles: false,
                  canDeleteRoles: false,
                  canAssignRoles: false,
              },
              ...permissions,
          };

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
    permissions: Partial<ChannelMgmtPermissions> | 'all' = {}
): ChannelMgmtPermissions =>
    permissions === 'all'
        ? {
              canSetMessageOfTheDay: true,
              canEditName: true,
              canSetImage: true,
              canViewUserTable: true,
              canEditTags: true,
          }
        : {
              ...{
                  canSetMessageOfTheDay: false,
                  canEditName: false,
                  canSetImage: false,
                  canViewUserTable: false,
                  canEditTags: false,
              },
              ...permissions,
          };

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
    permissions: Partial<ChannelModPermissions> | 'all' = {}
): ChannelModPermissions =>
    permissions === 'all'
        ? {
              canSetGuidelines: true,
              canTimeoutUsers: true,
              canBanUsers: true,
              canViewBannedUsers: true,
              canUnbanUsers: true,
              canDeletePosts: true,
              canDeleteComments: true,
              canEditPostTags: true,
              canViewReports: true,
              canUpdateReports: true,
              canResolveReports: true,
          }
        : {
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
              ...permissions,
          };

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
    permissions: Partial<EventMgmtPermissions> | 'all' = {}
): EventMgmtPermissions =>
    permissions === 'all'
        ? {
              canRegisterEvents: true,
              canViewEvents: true,
              canEditEvents: true,
              canUnregisterEvents: true,
          }
        : {
              ...{
                  canRegisterEvents: false,
                  canViewEvents: false,
                  canEditEvents: false,
                  canUnregisterEvents: false,
              },
              ...permissions,
          };

export const defaultPermissions = (overrides: Partial<Permissions> = {}): Permissions => ({
    ...overrides,
    ...{
        ...roleMgmtPermissions(),
        ...channelMgmtPermissions(),
        ...channelModPermissions(),
        ...eventMgmtPermissions(),
    },
});

/**
 * Utility for building a set of permissions using the builder pattern
 */
export class PermissionsBuilder {
    private permissions: Permissions;
    constructor(permissions: Partial<Permissions> | null = null) {
        this.permissions = defaultPermissions(permissions ?? {});
    }
    withAll() {
        this.permissions = {
            ...roleMgmtPermissions('all'),
            ...channelMgmtPermissions('all'),
            ...channelModPermissions('all'),
            ...eventMgmtPermissions('all'),
        };
        return this;
    }
    withRoleMgmt(permissions: Partial<RoleMgmtPermissions> | null = null) {
        this.permissions = {
            ...this.permissions,
            ...roleMgmtPermissions(permissions ?? 'all'),
        };
        return this;
    }
    withChannelMgmt(permissions: Partial<ChannelMgmtPermissions> | null = null) {
        this.permissions = { ...this.permissions, ...channelMgmtPermissions(permissions ?? 'all') };
        return this;
    }
    withChannelMod(permissions: Partial<ChannelModPermissions> | null = null) {
        this.permissions = { ...this.permissions, ...channelModPermissions(permissions ?? 'all') };
        return this;
    }
    withEventMgmt(permissions: Partial<EventMgmtPermissions> | null = null) {
        this.permissions = { ...this.permissions, ...eventMgmtPermissions(permissions ?? 'all') };
        return this;
    }
    with(permission: keyof Permissions, setting: boolean = true) {
        this.permissions[permission] = setting;
        return this;
    }
    build() {
        return this.permissions;
    }
}

export const permissionsBuilder = (permissions: Partial<Permissions> | null = null) => {
    return new PermissionsBuilder(permissions);
};
