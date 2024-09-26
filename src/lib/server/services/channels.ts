import type { DB } from '../drizzle';
import type { DbError, ResourceNotFoundError } from './utils/errors';
import type { DbResult } from './utils/types';
import type { Channel } from '../db/channels.sql';

/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { pageSize: number; page: number };
export type GetChannelsError = DbError;
export function getChannels(
    _db: DB,
    _opts?: GetChannelsOptions
): DbResult<Channel[], GetChannelsError> {
    throw new Error('Not implemented');
}

export type GetChannelError = DbError | ResourceNotFoundError;
/**
 * Retrieve channel by its id
 * @param _db PostgreSQL DB
 * @param _id Id of channel
 */
export function getChannelById(_db: DB, _id: string): DbResult<Channel, GetChannelError> {
    throw new Error('Not implemented');
}
