import { describe } from 'vitest';
import {
    getChannelById,
    getChannelInfo,
    getChannels,
    getChannelsByOwner,
    getUserSubscriptions,
    createChannel,
    publishChannel,
    userIsSubscribed,
    searchChannelsByName,
} from './channels';
import { testWithDb } from '$lib/testing/utils';
import { channelTable } from '../db/channels.sql';
import { userTable } from '../db/users.sql';
import type { DB } from '..';
import { subscriptionTable } from '../db/subscriptions.sql';
import { publicChannelTable, type PublicChannel } from '../db/public.channels.sql';

describe.concurrent('channels suite', () => {
    testWithDb(
        'getting channels returns successfully',
        async ({ expect, db }, { createdChannel }) => {
            const channels = await getChannels(db);
            expect(channels.length).toStrictEqual(1);
            expect(channels[0].name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );

    testWithDb(
        'getting channel by id returns successfully',
        async ({ expect, db }, { createdChannel }) => {
            const channel = await getChannelById(db, createdChannel.id);
            expect(channel?.name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );

    testWithDb(
        'getting channels by user id returns successfully',
        async ({ expect, db }, { creator, createdChannel }) => {
            const userChannels = await getChannelsByOwner(db, creator.id);
            expect(userChannels).toStrictEqual([createdChannel]);
        },
        generateUserAndChannel
    );

    testWithDb(
        "user's subscriptions can be fetched",
        async ({ expect, db }, { createdChannel, subscribers: [subscriber] }) => {
            const subscribedChannels = await getUserSubscriptions(db, subscriber.id);
            expect(subscribedChannels).toStrictEqual([
                { channelId: createdChannel.id, channelDisplayName: createdChannel.name },
            ]);
        },
        generateChannelAndSubs
    );

    testWithDb(
        "user's subscriptions can be fetched when there aren't any",
        async ({ expect, db }, { creator }) => {
            const subscribedChannels = await getUserSubscriptions(db, creator.id);
            expect(subscribedChannels).toStrictEqual([]);
        },
        generateUserAndPublicChannel
    );

    testWithDb(
        'many subscriptions are counted correctly',
        async ({ expect, db }, { createdChannel, subscriptionCount }) => {
            const channelInfo = await getChannelInfo(db, createdChannel.id);
            expect(channelInfo.subscribers).toStrictEqual(subscriptionCount);
        },
        generateChannelAndSubs
    );

    testWithDb(
        'zero subscriptions are counted correctly',
        async ({ expect, db }, { createdChannel }) => {
            const channelInfo = await getChannelInfo(db, createdChannel.id);
            expect(channelInfo.subscribers).toStrictEqual(0);
        },
        generateUserAndPublicChannel
    );

    testWithDb(
        'creating channels returns successfully',
        async ({ expect, db }, { creator }) => {
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
        async ({ expect, db }, { createdChannel }) => {
            const publishedChannel: PublicChannel = await publishChannel(db, createdChannel);

            expect(publishedChannel.name).toStrictEqual(createdChannel.name);
        },
        generateUserAndChannel
    );

    testWithDb(
        'User is subscribed',
        async ({ expect, db }, { creator, createdChannel }) => {
            await db
                .insert(subscriptionTable)
                .values({ userId: creator.id, channelId: createdChannel.id });
            const subscribed = await userIsSubscribed(db, creator.id, createdChannel.id);
            expect(subscribed).toStrictEqual(true);
        },
        generateUserAndChannel
    );

    testWithDb(
        'User is not subscribed',
        async ({ expect, db }, { creator, createdChannel }) => {
            const subscribed = await userIsSubscribed(db, creator.id, createdChannel.id);
            expect(subscribed).toStrictEqual(false);
        },
        generateUserAndChannel
    );

    testWithDb(
        'public channels can be searched',
        async ({ expect, db }, { creator, createdChannelPublicInfo }) => {
            const [n1, ...rest] = (await searchChannelsByName(db, 'surf', false, 0)).map(
                (c) => c.name
            );
            expect(rest).toHaveLength(0);
            expect(n1).toStrictEqual('Channel-Surfers');
            const channels = (await searchChannelsByName(db, 'surfres', false, 0)).map(
                (c) => c.name
            );
            expect(channels).toHaveLength(0);
        },
        generateUserAndPublicChannel
    );

    testWithDb(
        'Private channels can be searched',
        async ({ expect, db }, { creator, channels }) => {
            const caseOneExpected = [
                'c-1',
                ...Array.from({ length: 10 }, (_, n) => `c-1${n}`),
            ].slice(0, 5);
            const caseTwoExpected = ['c-2', 'c-12'];
            const caseThreeExpected = ['c-0', 'c-10'];
            const caseFourExpected = channels.slice(0, 5).map((c) => c.name);
            const caseOne = await searchChannelsByName(db, '1', true, 0, creator);
            expect(caseOne.map((c) => c.name)).toStrictEqual(caseOneExpected);
            const caseTwo = await searchChannelsByName(db, '2', true, 0, creator);
            expect(caseTwo.map((c) => c.name)).toStrictEqual(caseTwoExpected);
            const caseThree = await searchChannelsByName(db, '0', true, 0, creator);
            expect(caseThree.map((c) => c.name)).toStrictEqual(caseThreeExpected);
            const caseFour = await searchChannelsByName(db, 'c-', true, 0, creator);
            expect(caseFour.map((c) => c.name)).toStrictEqual(caseFourExpected);
        },
        generateUserAndChannels(20)
    );

    testWithDb(
        'Unowned private channels are not retrieved',
        async ({ expect, db }, { otherUser }) => {
            const caseOne = await searchChannelsByName(db, '1', true, 0, otherUser);
            const caseTwo = await searchChannelsByName(db, '2', true, 0, otherUser);
            const caseThree = await searchChannelsByName(db, '0', true, 0, otherUser);
            const caseFour = await searchChannelsByName(db, 'c-', true, 0, otherUser);
            expect(caseOne).toStrictEqual([]);
            expect(caseTwo).toStrictEqual([]);
            expect(caseThree).toStrictEqual([]);
            expect(caseFour).toStrictEqual([]);
        },
        generateUserAndChannelsAndOtherUser
    );
});

const generateUserAndChannel = async (db: DB) => {
    const [creator] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const [createdChannel] = await db
        .insert(channelTable)
        .values({ name: 'Channel-Surfers', createdBy: creator.id })
        .returning();
    return { creator, createdChannel };
};

const generateUserAndChannels = (count: number) => async (db: DB) => {
    const [creator] = await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning();
    const channels = await db
        .insert(channelTable)
        .values(
            Array.from({ length: count }, (_, n) => ({ name: `c-${n}`, createdBy: creator.id }))
        )
        .returning();
    return { creator, channels };
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

const generateUserAndChannelsAndOtherUser = async (db: DB) => {
    const { creator, channels } = await generateUserAndChannels(20)(db);
    const { creator: otherUser } = await generateUser(db);
    return { creator, channels, otherUser };
};

const generateUser = async (db: DB) => {
    const creator = (await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning())[0];

    return { creator };
};
