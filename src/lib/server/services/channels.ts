import { channel } from '../db/channels.sql';
import { Effect } from 'effect';
import type { DB } from '..';

/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { pageSize: number; page: number };
//export type GetChannelsError = DbError;
export const getChannels = (db: DB, opts?: GetChannelsOptions) =>
    Effect.tryPromise({
        try: () => {
            if (opts) {
                return db
                    .select()
                    .from(channel)
                    .limit(opts.pageSize)
                    .offset(opts.pageSize * (opts.page - 1));
            } else {
                return db.select().from(channel);
            }
        },
        catch: (err: unknown) => new Error(`Something went wrong: ${err}`),
    });

//export type GetChannelError = DbError | ResourceNotFoundError;
/**
 * Retrieve channel by its id
 * @param _db PostgreSQL DB
 * @param _id Id of channel
 */
export const getChannelById = (db: DB, id: string) =>
    Effect.tryPromise({
        try: () =>
            db.query.channel.findFirst({
                with: {
                    id,
                },
            }),
        catch: (err: unknown) => new Error(`Something went wrong: ${err}`),
    });
