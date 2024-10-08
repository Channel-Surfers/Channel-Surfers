import { channelTable, type Channel, type NewChannel } from '../db/channels.sql';
import type { DB } from '..';
import { ResourceNotFoundError } from './utils/errors';
import { countDistinct, eq } from 'drizzle-orm';
import { subscriptionTable } from '../db/subscriptions.sql';
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

/**
 * Return channels that a user has subscribed to
 * @param db PostgreSQL db
 * @param userId identifies a particular user
 */
export const getUserSubscriptions = async (db: DB, userId: string) => {
    return await db
        .select({ channelId: channelTable.id, channelDisplayName: publicChannelTable.name })
        .from(channelTable)
        .innerJoin(publicChannelTable, eq(channelTable.id, publicChannelTable.channelId))
        .innerJoin(subscriptionTable, eq(channelTable.id, subscriptionTable.channelId))
        .where(eq(subscriptionTable.userId, userId));
};
export type UserSubscription = Awaited<ReturnType<typeof getUserSubscriptions>>[0];

/**
 * Get information about a channel
 * @param db PostgreSQL db
 * @param channelId identifies a particular channel
 */
export const getChannelInfo = async (
    db: DB,
    channelId: string
): Promise<Channel & { subscriptionsCount: number }> => {
    const [ret] = await db
        .select({
            id: channelTable.id,
            icon: channelTable.icon,
            bannerImage: channelTable.bannerImage,
            name: channelTable.name,
            description: channelTable.description,
            guidelines: channelTable.guidelines,
            createdBy: channelTable.createdBy,
            createdOn: channelTable.createdOn,
            updatedOn: channelTable.updatedOn,
            subscriptionsCount: countDistinct(subscriptionTable.id),
        })
        .from(channelTable)
        .leftJoin(subscriptionTable, eq(channelTable.id, subscriptionTable.channelId)) // Ensure you're joining on the correct foreign key
        .where(eq(channelTable.id, channelId))
        .groupBy(
            channelTable.id,
            channelTable.icon,
            channelTable.bannerImage,
            channelTable.name,
            channelTable.description,
            channelTable.guidelines,
            channelTable.createdBy,
            channelTable.createdOn,
            channelTable.updatedOn
        );
    return ret;
};
export type ChannelInfo = Awaited<ReturnType<typeof getChannelInfo>>;

/**
 * Get channels that a user owns
 * @param db PostgreSQL db
 * @param userId identifies a particular user
 */
export const getChannelsByOwner = async (db: DB, userId: string): Promise<Channel[]> => {
    return await db.select().from(channelTable).where(eq(channelTable.createdBy, userId));
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

