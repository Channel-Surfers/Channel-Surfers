import { channelTable, type Channel, type NewChannel } from '../db/channels.sql';
import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { eq } from 'drizzle-orm';
import { publicChannelTable, type PublicChannel } from '../db/public.channels.sql';

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

export const createChannel = async (db: DB, channelData: NewChannel): Promise<Channel> => {
    const [channel] = await db.insert(channelTable).values(channelData).returning();

    return channel;
};

export const publishChannel = async (db: DB, channel: Channel): Promise<PublicChannel> => {
    const [publicChannel] = await db
        .insert(publicChannelTable)
        .values({
            name: channel.name,
            channelId: channel.id,
        })
        .returning();

    return publicChannel;
};

export const getChannelsByOwner = async (db: DB, userId: string): Promise<Channel[]> => {
    return await db.select().from(channelTable).where(eq(channelTable.createdBy, userId));
};
