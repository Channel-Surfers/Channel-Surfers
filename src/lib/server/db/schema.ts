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
To simplify the definition of the Drizzle config, it's best if the schema is all contained a single module. Thus,
we re-export all members as part of the `schema` module. This is required for the `db.query` functionality to
work.
*/
