import { getDb } from '$lib/server';
import { assertAuth } from '$lib/server/auth';
import { searchChannelsByName } from '$lib/server/services/channels';
import { Type } from '@sinclair/typebox';
import { AssertError, Value } from '@sinclair/typebox/value';
import { error, json, type RequestHandler } from '@sveltejs/kit';

const queryValidator = Type.Object({
    name: Type.String({
        minLength: 1,
    }),
    isPrivate: Type.Boolean(),
    page: Type.Integer({
        min: 0,
    }),
});

export const GET: RequestHandler = async ({ locals, url }) => {
    const db = await getDb();
    const name = url.searchParams.get('name');
    const isPrivate = url.searchParams.get('isPrivate');
    const page = url.searchParams.get('page');

    let body;
    try {
        body = Value.Parse(queryValidator, { name, isPrivate, page });
    } catch (e) {
        if (e instanceof AssertError) {
            console.log(e.message);
            const errors = [];
            for (const err of e.Errors()) {
                errors.push(err.message);
            }
            throw error(400, errors.join(', '));
        } else throw error(500, 'unexpected error occurred');
    }
    console.log(body);

    if (body.isPrivate) {
        const channels = (
            await searchChannelsByName(db, body.name, body.isPrivate, body.page, null)
        ).map(({ channel, public_channel }) => ({
            channelId: channel.id,
            name: public_channel?.name,
            icon: channel.icon,
        }));
        console.log(channels);
        return json(channels);
    } else {
        if (!locals.user) throw error(403, 'Must be logged in to access private channels query');
        const channels = (
            await searchChannelsByName(db, body.name, body.isPrivate, body.page, locals.user)
        ).map(({ channel, public_channel }) => ({
            channelId: channel.id,
            name: public_channel?.name,
            icon: channel.icon,
        }));
        return json(channels);
    }

    throw error(501, 'unimplemented');
};
