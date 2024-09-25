import { type Result } from 'ts-results';
import type { Channel } from './schema/channels.sql';
import type { BadOptsError, DbError, ResourceNotFoundError } from './errors';

export type AsyncResult<T, E> = Promise<Result<T, E>>;

// Q: Is there a better place for these type signatures?
/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { ownerId: string } & ({ pageSize: number; page: number } | null);
export type GetChannelsError = DbError;
/**
 * Grab a channel by
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelOptions = { id: string };
export type GetChannelError = DbError | ResourceNotFoundError | BadOptsError<GetChannelOptions>;
/**
 * DAL (Data Access Layer) is a source of truth for what methods exist for retrieving data.
 * With this interface, we can minimize the amount of database queries explicitly defined
 * throughout appliication code. Provided some class that `implements DAL`, you can execute
 * queries as follows (using PostgreSQL as example):
 *
 * ```typescript
 * const dal = new PostgresDAL(db);
 * const channelsResult = await dal.getChannels();
 * if (channelsResult.err) {
 *     // handle your error
 *     return;
 * }
 * // intellisense now knows that our value is of type Channel[]
 * for (const channel of Channels) {
 *     console.log(channel);
 * }
 * ```
 */
export interface DAL {
    /**
     * Get a list of channels or an error
     * @param options allows one to fine-tune the returned results
     */
    getChannels(options: GetChannelsOptions): AsyncResult<Channel[], GetChannelsError>;
    getChannel(opts: GetChannelOptions): AsyncResult<Channel, GetChannelError>;
}
