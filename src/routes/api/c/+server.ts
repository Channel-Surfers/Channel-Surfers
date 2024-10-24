import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { assertAuth } from '$lib/server/auth';
import { type CreateChannel } from '$lib/types';
import type { NewChannel } from '$lib/server/db/channels.sql';
import { createChannel, getPrivateChannel, getPublicChannelByName, publishChannel } from '$lib/server/services/channels';
import { getDb } from '$lib/server';
import { validateUrl } from '$lib/util';

export const POST: RequestHandler = async (event) => {
    assertAuth(event);
    const { request } = event;
    const { name, description, guidelines, bannerImage, icon, publishNow }: CreateChannel = await request.json();
    
    const db = await getDb();
    if (publishNow) {
        const existingChannel = await getPublicChannelByName(db, name);
        if (existingChannel) {
            return json(
                { name: 'Channel name already in use' },
                { status: 409 }
            );
        }
    } else {
        const existingChannel = await getPrivateChannel(db, event.locals.user.id, name);
        if (existingChannel) {
            return json(
                { name: 'You already have a channel by this name' },
                { status: 409 }
            );
        }
    }

    {
        const err: { [key in keyof CreateChannel]?: string } = { };
        if (!name) err.name = 'Name must be provided';
        if (description && description.length > 4000) err.description = 'Description must be fewer than 4000 characters';
        if (guidelines && guidelines.length > 4000) err.guidelines = 'Guidelines must be fewer than 4000 characters';
        if (bannerImage && !validateUrl(bannerImage)) err.bannerImage = 'Not a valid URL';
        if (icon && !validateUrl(icon)) err.icon = 'Must be a valid URL';

        if (Object.keys(err).length) {
            return json(err, { status: 400 });
        }
    }

    const newChannel: NewChannel = {
        name,
        description,
        guidelines,
        bannerImage,
        icon,
        createdBy: event.locals.user.id,
    };

    const channel = await createChannel(db, newChannel);

    if (publishNow) {
        await publishChannel(db, channel);
    }

    return json(channel, { status: 201 });
};
