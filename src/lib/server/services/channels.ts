import { channelTable, type Channel, type NewChannel } from '../db/channels.sql';
import { Effect } from 'effect';
import type { DB } from '..';
import { DbError, ResourceNotFoundError } from './utils/errors';
import { eq } from 'drizzle-orm';

/**
 * Return a list of channels
 * @param db PostgreSQL DB
 * @param opts Pagination options
 */
export const getChannels = (db: DB, opts?: { pageSize: number; page: number }) =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () =>
                opts
                    ? db
                          .select()
                          .from(channelTable)
                          .limit(opts.pageSize)
                          .offset(opts.pageSize * (opts.page - 1))
                    : db.select().from(channelTable),
            catch: (error: unknown) =>
                new DbError({ message: `Unknown database error occurred: ${error}` }),
        });

        return dbResponse;
    });

/**
 * Retrieve channel by its id
 * @param db PostgreSQL DB
 * @param id Id of channel
 */
export const getChannelById = (
    db: DB,
    id: string
): Effect.Effect<Channel, DbError | ResourceNotFoundError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.select().from(channelTable).where(eq(channelTable.id, id)),
            catch: (err: unknown) => new DbError({ message: `Something went wrong: ${err}` }),
        });
        if (dbResponse.length == 0) {
            Effect.fail(
                new ResourceNotFoundError({ message: 'Could not find channel by provided id' })
            );
        }

        return dbResponse[0];
    });

export const getChannelsByOwner = (db: DB, userId: string): Effect.Effect<Channel[], DbError> =>
    Effect.gen(function* (_) {
        const dbResponse = yield* Effect.tryPromise({
            try: () => db.select().from(channelTable).where(eq(channelTable.createdBy, userId)),
            catch: (err: unknown) => new DbError({ message: `Something went wrong: ${err}` }),
        });
        return dbResponse;
    });

export const createChannel = async (db: DB, channelData: NewChannel): Promise<Channel> => {
    const [channel] = await db.insert(channelTable).values(channelData).returning();

    return channel;
};
