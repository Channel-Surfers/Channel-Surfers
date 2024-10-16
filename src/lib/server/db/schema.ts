import { channelBannedUserTable } from './bans.channels.users.sql';
import { userBlockTable } from './blocks.users.sql';
import { channelTable } from './channels.sql';
import { commentTable } from './comments.sql';
import { followTable } from './follows.sql';
import { inviteTable } from './invites.sql';
import { playlistPostTable } from './playlists.posts.sql';
import { playlistTable } from './playlists.sql';
import { postTable } from './posts.sql';
import { publicChannelTable } from './public.channels.sql';
import { channelPostReportTable } from './reports.channels.posts.sql';
import { channelReportTable } from './reports.channels.sql';
import { channelUserReportTable } from './reports.channels.users.sql';
import { userReportTable } from './reports.users.sql';
import { roleTable } from './roles.sql';
import { userRoleTable } from './roles.users.sql';
import { sessionTable } from './sessions.sql';
import { subscriptionTable } from './subscriptions.sql';
import { channelTagsTable } from './tags.channels.sql';
import { postTagTable } from './tags.posts.sql';
import { userTable } from './users.sql';
import { commentVoteTable } from './votes.comments.sql';
import { postVoteTable } from './votes.posts.sql';

export * from './bans.channels.users.sql';
export * from './blocks.users.sql';
export * from './channels.sql';
export * from './comments.sql';
export * from './follows.sql';
export * from './invites.sql';
export * from './playlists.posts.sql';
export * from './playlists.sql';
export * from './posts.sql';
export * from './public.channels.sql';
export * from './reports.channels.posts.sql';
export * from './reports.channels.sql';
export * from './reports.channels.users.sql';
export * from './reports.posts.sql';
export * from './reports.users.sql';
export * from './roles.sql';
export * from './roles.users.sql';
export * from './sessions.sql';
export * from './subscriptions.sql';
export * from './tags.channels.sql';
export * from './tags.posts.sql';
export * from './users.sql';
export * from './votes.comments.sql';
export * from './votes.posts.sql';

/**
 * This is a list of all of our database tables
 * It is essential that this list be kept up to date to guarantee test isolation
 */
export const tables = [
    channelBannedUserTable,
    userBlockTable,
    subscriptionTable,
    commentTable,
    followTable,
    inviteTable,
    playlistPostTable,
    playlistTable,
    publicChannelTable,
    channelPostReportTable,
    channelReportTable,
    channelUserReportTable,
    userReportTable,
    roleTable,
    userRoleTable,
    sessionTable,
    channelTagsTable,
    postTagTable,
    commentVoteTable,
    postVoteTable,
    postTable,
    channelTable,
    userTable,
];

/**
To simplify the definition of the Drizzle config, it's best if the schema is all contained a single module. Thus,
we re-export all members as part of the `schema` module. This is required for the `db.query` functionality to
work.
*/
