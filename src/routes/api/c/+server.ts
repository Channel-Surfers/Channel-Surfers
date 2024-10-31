import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertAuth } from '$lib/server/auth';
import { type CreateChannel } from '$lib/types';
import type { NewChannel } from '$lib/server/db/channels.sql';
import {
    createChannel,
    getPrivateChannel,
    getPublicChannelByName,
    publishChannel,
} from '$lib/server/services/channels';
import { getDb } from '$lib/server';
import * as v from 'valibot';
import { createChannelSchema } from '$lib/validation';

export const POST: RequestHandler = async (event) => {
    assertAuth(event);
    const { request } = event;
    const db = await getDb();

    const data: v.InferOutput<typeof createChannelSchema> = await request.json();
    const parsed = v.safeParse(createChannelSchema, data);
    let { success } = parsed;

    console.log({ success, issues: parsed.issues });
    const errors: { [k in keyof v.InferInput<typeof createChannelSchema>]: string[]; } = {
        name: [],
        description: [],
        guidelines: [],
        bannerImage: [],
        icon: [],
        publishNow: [],
    };

    let error = 400;
    if (!errors.name.length) {
        if (data.publishNow) {
            const existingChannel = await getPublicChannelByName(db, data.name);
            if (existingChannel) {
                errors.name.unshift('Channel name already in use');
                error = 409;
                success = false;
            }
        } else {
            const existingChannel = await getPrivateChannel(db, event.locals.user.id, data.name);
            if (existingChannel) {
                errors.name.unshift('You already have a channel by this name');
                error = 409;
                success = false;
            }
        }
    }

    if (!success) {
        for (const issue of parsed.issues || []) {
            errors[issue.path![0].key as keyof typeof errors]!.push(issue.message);
        }
        return json(errors, { status: error });
    }

    const newChannel: NewChannel = {
        name: data.name,
        description: data.description,
        guidelines: data.guidelines,
        bannerImage: data.bannerImage,
        icon: data.icon,
        createdBy: event.locals.user.id,
    };

    const channel = await createChannel(db, newChannel);

    if (data.publishNow) {
        await publishChannel(db, channel);
    }

    return json(channel, { status: 201 });
};
