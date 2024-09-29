import { channel, type Channel } from '../db/channels.sql';
import { Effect } from 'effect';
import type { DB } from '..';
import { DbError, ResourceNotFoundError } from './utils/errors';
import { eq } from 'drizzle-orm';

/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { pageSize: number; page: number };
export type GetChannelsError = DbError;
export const getChannels = (db: DB, opts?: GetChannelsOptions) =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () =>
                opts
                    ? db
                          .select()
                          .from(channel)
                          .limit(opts.pageSize)
                          .offset(opts.pageSize * (opts.page - 1))
                    : db.select().from(channel),
            catch: (error: unknown) =>
                new DbError({ message: `Unknown database error occurred: ${error}` }),
        });

        return dbResponse;
    });

export type GetChannelError = DbError | ResourceNotFoundError;
/**
 * Retrieve channel by its id
 * @param _db PostgreSQL DB
 * @param _id Id of channel
 */
export const getChannelById = (db: DB, id: string): Effect.Effect<Channel, GetChannelError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.select().from(channel).where(eq(channel.id, id)),
            catch: (err: unknown) => new DbError({ message: `Something went wrong: ${err}` }),
        });
        if (dbResponse.length == 0) {
            Effect.fail(
                new ResourceNotFoundError({ message: 'Could not find channel by provided id' })
            );
        }

        return dbResponse[0];
    });
