import { dev } from '$app/environment';
import { Discord } from 'arctic';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { getDb } from '..';
import { Lucia, type Session } from 'lucia';
import { sessionTable } from '../db/sessions.sql';
import type { Cookies } from '@sveltejs/kit';
import type { SiteRole } from '../db/types.sql';
import { userTable } from '../db/users.sql';

import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ORIGIN } from '$env/static/private';
import { Effect } from 'effect';
import { getUserByAuth, getUserById } from '../services/users';

let lucia: Lucia | undefined;

/**
 * Get the lucia client or make it if necessary
 */
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
            };
        },
    });

    return lucia;
};

export const signOut = async (session: Session | null, cookies: Cookies) => {
    if (!session) {
        return false;
    }
    const lucia = await getLucia();
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
    });
    return true;
};

export const updateLocals = async ({
    cookies,
    locals,
}: {
    cookies: Cookies;
    locals: App.Locals;
}) => {
    const lucia = await getLucia();

    const sessionId = cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
        locals.user = null;
        locals.session = null;
        return;
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        // sveltekit types deviates from the de-facto standard
        // you can use 'as any' too
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }
    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });
    }

    if (user === null) return;

    const db = await getDb();
    let dbUser = await Effect.runPromise(
        getUserById(db, user.id)
    );

    locals.user = {
        id: dbUser.id,
        username: dbUser.username,
        profileImage: dbUser.profileImage,
        role: dbUser.role,
        createdOn: dbUser.createdOn,
    };
    locals.session = session;
};

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: AuthUser;
    }
}

export interface AuthUser {
    id: string;
    username: string;
    profileImage: string | null;
    role: SiteRole;
    createdOn: Date;
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
