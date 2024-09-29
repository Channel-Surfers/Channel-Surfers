import { describe, expect, it } from 'vitest';
import { getChannelById, getChannels } from './channels';
import { Effect } from 'effect';
import { createTestingDb } from '$lib/testing/utils';
import { channel } from '../db/channels.sql';
import { user } from '../db/users.sql';

describe('channels suite', () => {
    it.concurrent('getting channels returns successfully', { timeout: 20000 }, async () => {
        const { db, generated } = await createTestingDb(async (db) => {
            const creator = (
                await db.insert(user).values({ username: 'AwesomeGuy' }).returning()
            )[0];
            const createdChannel = (
                await db
                    .insert(channel)
                    .values({ name: 'Channel-Surfers', createdBy: creator.id })
                    .returning()
            )[0];
            return { creator, createdChannel };
        });

        if (!generated) process.exit(1);

        const { createdChannel } = generated;

        const channels = await Effect.runPromise(getChannels(db));
        expect(channels.length).toStrictEqual(1);
        expect(channels[0].name).toStrictEqual(createdChannel.name);
    });

    it.concurrent('getting channel by id returns successfully', { timeout: 20000 }, async () => {
        const { db, generated } = await createTestingDb(async (db) => {
            const creator = (
                await db.insert(user).values({ username: 'AwesomeGuy' }).returning()
            )[0];
            const createdChannel = (
                await db
                    .insert(channel)
                    .values({ name: 'Channel-Surfers', createdBy: creator.id })
                    .returning()
            )[0];
            return { creator, createdChannel };
        });

        if (!generated) process.exit(1);

        const { createdChannel } = generated;

        const c = await Effect.runPromise(getChannelById(db, createdChannel.id));
        expect(c?.name).toStrictEqual(createdChannel.name);
    });
});
