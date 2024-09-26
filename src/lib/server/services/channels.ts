import type { DB } from '../drizzle';
import type { BadOptsError, DbError, ResourceNotFoundError } from './utils/errors';
import type { DbResult } from './utils/types';
import type { Channel } from '../db/channels.sql';

/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { ownerId: string } & ({ pageSize: number; page: number } | null);
export type GetChannelsError = DbError;
export function getChannels(_db: DB): DbResult<Channel[], GetChannelsError> {
    throw new Error('Not implemented');
}

/**
 * Grab a channel by
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelOptions = { id: string };
export type GetChannelError = DbError | ResourceNotFoundError | BadOptsError<GetChannelOptions>;
export function getChannel(_db: DB): DbResult<Channel, GetChannelError> {
    throw new Error('Not implemented');
}
