import { dev } from '$app/environment';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { getDb } from '..';
import { Lucia } from 'lucia';
import { sessionTable } from '../db/sessions.sql';
import { userTable, type User } from '../db/users.sql';

import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ORIGIN } from '$env/static/private';
import { Discord } from 'arctic';

let lucia: Lucia | undefined;

export const getLucia = async () => {
    if (lucia) return lucia;

    const adapter = new DrizzlePostgreSQLAdapter(await getDb(), sessionTable, userTable);

    lucia = new Lucia(adapter, {
        sessionCookie: {
            attributes: {
                secure: !dev,
            },
        },
        getUserAttributes: (attributes) => {
            return {
                id: attributes.id,
                username: attributes.username,
                profileImage: attributes.profileImage,
                role: attributes.role,
                createdOn: attributes.createdOn,
                discordId: attributes.discordId,
            };
        },
    });

    return lucia;
};

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: User;
    }
}

const determineOrigin = () => {
    let origin = ORIGIN ?? 'localhost:5173';
    if (origin.endsWith('/')) {
        origin = origin.substring(0, ORIGIN.length - 1);
    }

    if (!origin.startsWith('http')) {
        origin = `http${dev ? '' : 's'}://${origin}`;
    }
    return origin;
};

const origin = determineOrigin();

export const discord = new Discord(
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    `${origin}/signin/discord/callback`
);
