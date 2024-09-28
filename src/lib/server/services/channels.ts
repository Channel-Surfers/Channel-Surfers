import { channel, type Channel } from '../db/channels.sql';
import type { DB } from '..';
import { asc, eq } from 'drizzle-orm';

/**
 * Fine-tune what channel data we want to focus on
 * @property pageSize specifies how many elements are to be fetched
 * @property page specifies which page to fetch
 */
export type GetChannelsOptions = { pageSize: number; page: number };
//export type GetChannelsError = DbError;
export async function getChannels(db: DB, opts?: GetChannelsOptions): Promise<Channel[]> {
    let result;
    if (opts) {
        result = await db
            .select()
            .from(channel)
            .orderBy(asc(channel.createdOn))
            .limit(opts.pageSize)
            .offset(opts.pageSize * (opts.page - 1));
    } else {
        result = await db.select().from(channel);
    }
    return result;
}

//export type GetChannelError = DbError | ResourceNotFoundError;
/**
 * Retrieve channel by its id
 * @param _db PostgreSQL DB
 * @param _id Id of channel
 */
export async function getChannelById(db: DB, id: string): Promise<Channel> {
    return (await db.select().from(channel).where(eq(channel.id, id)))[0];
}
