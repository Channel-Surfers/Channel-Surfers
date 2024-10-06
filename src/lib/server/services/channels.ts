import { channelTable, type Channel } from '../db/channels.sql';
import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { eq } from 'drizzle-orm';
import { publicChannelTable } from '../db/public.channels.sql';

/**
 * Return a list of channels
 * @param db PostgreSQL DB
 * @param opts Pagination options
 */
export const getChannels = async (db: DB, opts?: { pageSize: number; page: number }) => {
    const dbResponse = opts
        ? db
              .select()
              .from(channelTable)
              .limit(opts.pageSize)
              .offset(opts.pageSize * (opts.page - 1))
        : db.select().from(channelTable);

    return dbResponse;
};

/**
 * Retrieve channel by its id
 * @param db PostgreSQL DB
 * @param id Id of channel
 */
export const getChannelById = async (db: DB, id: string): Promise<Channel> => {
    const [ret] = await db.select().from(channelTable).where(eq(channelTable.id, id));

    if (!ret) {
        throw new ResourceNotFoundError({ message: 'Could not find channel by provided id' });
    }

    return ret;
};

export const getChannelsByOwner = async (db: DB, userId: string): Promise<Channel[]> => {
    return await db.select().from(channelTable).where(eq(channelTable.createdBy, userId));
};

export const getPublicChannelByName = async (db: DB, name: string): Promise<Channel | null> => {
    const [ret] = await db
        .select()
        .from(publicChannelTable)
        .innerJoin(channelTable, eq(channelTable.id, publicChannelTable.channelId))
        .where(eq(publicChannelTable.name, name));
    if (!ret) return null;
    return ret.channel;
};
