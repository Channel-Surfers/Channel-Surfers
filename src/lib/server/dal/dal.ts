import type { Result } from 'ts-results';
import type { Channel } from './schema/channels.sql';
import type { DbError } from './errors';

export type AsyncResult<T, E> = Promise<Result<T, E>>;

// Q: Is there a better place for these type signatures?
export type GetChannelsOptions = { pageSize: number; page: number };
export type GetChannelsError = DbError;
export type GetChannelOptions = { id: string };
export type GetChannelError = DbError;
export interface DAL {
    getChannels(options: GetChannelsOptions): AsyncResult<Channel[], GetChannelsError>;
    getChannel(opts: GetChannelOptions): AsyncResult<Channel, GetChannelError>;
}
