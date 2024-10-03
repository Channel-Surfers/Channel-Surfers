import { describe, it } from 'vitest';
import { getChannelById, getChannels, getChannelsByOwner } from './channels';
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

describe('channels suite', () => {
    it.concurrent('getting channels returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);

        const { createdChannel } = mustGenerate(generated);

        const channels = await getChannels(db);
        expect(channels.length).toStrictEqual(1);
        expect(channels[0].name).toStrictEqual(createdChannel.name);
    });

    it.concurrent('getting channel by id returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);

        const { createdChannel } = mustGenerate(generated);

        const channel = await getChannelById(db, createdChannel.id);
        expect(channel?.name).toStrictEqual(createdChannel.name);
    });

    it.concurrent('getting channels by user id returns successfully', async ({ expect }) => {
        const { db, generated } = await createTestingDb(generateUserAndChannel);
        mustGenerate(generated);

        const { creator, createdChannel } = mustGenerate(generated);

        const userChannels = await getChannelsByOwner(db, creator.id);
        expect(userChannels).toStrictEqual([createdChannel]);
    });
});
