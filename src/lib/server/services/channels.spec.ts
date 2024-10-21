import { describe } from 'vitest';
import {
    getChannelById,
    getChannelInfo,
    getChannels,
    getChannelsByOwner,
    getUserSubscriptions,
    createChannel,
    publishChannel,
} from './channels';
import { mustGenerate, testWithDb } from '$lib/testing/utils';
import { channelTable } from '../db/channels.sql';
import { userTable } from '../db/users.sql';
import type { DB } from '..';
import { subscriptionTable } from '../db/subscriptions.sql';
import { publicChannelTable, type PublicChannel } from '../db/public.channels.sql';

const generateUserAndChannel = async (db: DB) => {
    const [creator] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const [createdChannel] = await db
        .insert(channelTable)
        .values({ name: 'Channel-Surfers', createdBy: creator.id })
        .returning();
    return { creator, createdChannel };
};

const generateUserAndPublicChannel = async (db: DB) => {
    const { creator, createdChannel } = await generateUserAndChannel(db);
    const [createdChannelPublicInfo] = await db
        .insert(publicChannelTable)
        .values({ channelId: createdChannel.id, name: createdChannel.name })
        .returning();
    return { creator, createdChannel, createdChannelPublicInfo };
};

const generateChannelAndSubs = async (db: DB) => {
    const { creator, createdChannel } = await generateUserAndPublicChannel(db);
    // create subscriptions for channel and return the count
    const subscribers = await db
        .insert(userTable)
        .values(Array.from({ length: 303 }, (_, n) => ({ username: `sub-${n}` })))
        .returning();
    const subscriptions = await db
        .insert(subscriptionTable)
        .values(subscribers.map((user) => ({ channelId: createdChannel.id, userId: user.id })))
        .returning();
    return { creator, createdChannel, subscriptionCount: subscriptions.length, subscribers };
};

const generateUser = async (db: DB) => {
    const creator = (await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning())[0];

    return { creator };
};

describe.concurrent('channels suite', () => {
    testWithDb(
        'getting channels returns successfully',
        async ({ expect, db, generated }) => {
            const { createdChannel } = mustGenerate(generated);

            const channels = await getChannels(db);
            expect(channels.length).toStrictEqual(1);
            expect(channels[0].name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );

    testWithDb(
        'getting channel by id returns successfully',
        async ({ expect, db, generated }) => {
            const { createdChannel } = mustGenerate(generated);

            const channel = await getChannelById(db, createdChannel.id);
            expect(channel?.name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );

    testWithDb(
        'getting channels by user id returns successfully',
        async ({ expect, db, generated }) => {
            const { creator, createdChannel } = mustGenerate(generated);

            const userChannels = await getChannelsByOwner(db, creator.id);
            expect(userChannels).toStrictEqual([createdChannel]);
        },
        generateUserAndChannel
    );

    testWithDb(
        "user's subscriptions can be fetched",
        async ({ expect, db, generated }) => {
            const {
                createdChannel,
                subscribers: [subscriber],
            } = mustGenerate(generated);
            const subscribedChannels = await getUserSubscriptions(db, subscriber.id);
            expect(subscribedChannels).toStrictEqual([
                { channelId: createdChannel.id, channelDisplayName: createdChannel.name },
            ]);
        },
        generateChannelAndSubs
    );

    testWithDb(
        "user's subscriptions can be fetched when there aren't any",
        async ({ expect, db, generated }) => {
            const { creator } = mustGenerate(generated);
            const subscribedChannels = await getUserSubscriptions(db, creator.id);
            expect(subscribedChannels).toStrictEqual([]);
        },
        generateUserAndPublicChannel
    );

    testWithDb(
        'many subscriptions are counted correctly',
        async ({ expect, db, generated }) => {
            const { createdChannel, subscriptionCount } = mustGenerate(generated);

            const channelInfo = await getChannelInfo(db, createdChannel.id);
            expect(channelInfo.subscribers).toStrictEqual(subscriptionCount);
        },
        generateChannelAndSubs
    );

    testWithDb(
        'zero subscriptions are counted correctly',
        async ({ expect, db, generated }) => {
            const { createdChannel } = mustGenerate(generated);

            const channelInfo = await getChannelInfo(db, createdChannel.id);
            expect(channelInfo.subscribers).toStrictEqual(0);
        },
        generateUserAndPublicChannel
    );

    testWithDb(
        'creating channels returns successfully',
        async ({ expect, db, generated }) => {
            const { creator } = mustGenerate(generated);

            const userChannels = await createChannel(db, {
                name: "Evan's Channel",
                createdBy: creator.id,
                description: 'Funny',
                guidelines: 'None',
            });
            expect(userChannels.name).toStrictEqual("Evan's Channel");
        },
        generateUser
    );

    testWithDb(
        'publishing channels returns successfully',
        async ({ expect, db, generated }) => {
            const { createdChannel } = mustGenerate(generated);

            const publishedChannel: PublicChannel = await publishChannel(db, createdChannel);

            expect(publishedChannel.name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );
});
