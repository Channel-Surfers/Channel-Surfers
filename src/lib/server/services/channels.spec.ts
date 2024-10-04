import { describe, it } from 'vitest';
import { getChannelById, getChannels, getChannelsByOwner, createChannel } from './channels';
import { Effect } from 'effect';
import { createTestingDb, mustGenerate } from '$lib/testing/utils';
import { channelTable } from '../db/channels.sql';
import { userTable } from '../db/users.sql';
import type { DB } from '..';

const generateUserAndChannel = async (db: DB) => {
    const creator = (await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning())[0];
    const createdChannel = (
        await db
            .insert(channelTable)
            .values({ name: 'Channel-Surfers', createdBy: creator.id })
            .returning()
    )[0];
    return { creator, createdChannel };
};

const generateUser = async (db: DB) => {
    const creator = (await db.insert(userTable).values({ username: 'AwesomeGuy' }).returning())[0];

    return { creator };
};

describe('channels suite', () => {
    it.concurrent('getting channels returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);

        const { createdChannel } = mustGenerate(generated);

        const channels = await Effect.runPromise(getChannels(db));
        expect(channels.length).toStrictEqual(1);
        expect(channels[0].name).toStrictEqual(createdChannel.name);
    });

    it.concurrent('getting channel by id returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);

        const { createdChannel } = mustGenerate(generated);

        const channel = await Effect.runPromise(getChannelById(db, createdChannel.id));
        expect(channel?.name).toStrictEqual(createdChannel.name);
    });

    it.concurrent('getting channels by user id returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);
        mustGenerate(generated);

        const { creator, createdChannel } = mustGenerate(generated);

        const userChannels = await Effect.runPromise(getChannelsByOwner(db, creator.id));
        expect(userChannels).toStrictEqual([createdChannel]);
    });

    it.concurrent('creating channels returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUser);

        const { creator } = mustGenerate(generated);

        const userChannels = await createChannel(db, {
            name: "Evan's Channel",
            createdBy: creator.id,
            description: 'Funny',
            guidelines: 'None',
        });
        expect(userChannels.name).toStrictEqual("Evan's Channel");
    });
});
