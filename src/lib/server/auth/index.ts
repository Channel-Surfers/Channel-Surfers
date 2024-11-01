import { dev } from '$app/environment';
import { GitHub } from 'arctic';
import { Discord } from 'arctic';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { getDb } from '..';
import { getUserById } from '../services/users';
import { Lucia, type Session } from 'lucia';
import { sessionTable } from '../db/sessions.sql';
import { userTable, type User } from '../db/users.sql';

import { redirect, type Cookies } from '@sveltejs/kit';
import type { SiteRole } from '../db/types.sql';

import {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    BASE_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
} from '$env/static/private';

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

/**
 * Sign the user out of their currently active session
 *
 * If session is `null`, nothing happens
 * @returns Whether the session was signed out successfully
 */
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

/**
 * Set the cookies required for an active session
 */
export const setSessionCookies = async (user: User, cookies: Cookies) => {
    const lucia = await getLucia();
    // Set session & cookies
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
        path: '.',
        ...sessionCookie.attributes,
    });
};

/**
 * Update the locals for a session -- must be called after a form action that
 * modifies the users session in some way
 */
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
    const dbUser = await getUserById(db, user.id);

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

/**
 * A user that has been authenticated -- this struct should be safe to send to
 * the client, so no sensitive data
 */
export interface AuthUser {
    id: string;
    username: string;
    profileImage: string | null;
    role: SiteRole;
    createdOn: Date;
}

/**
 * Get the base_url from the `BASE_URL` environment variable and transform it into
 * the desired form
 */
const determineOrigin = () => {
    let baseUrl = BASE_URL ?? 'localhost:5173';
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, BASE_URL.length - 1);
    }

    if (!baseUrl.startsWith('http')) {
        baseUrl = `http${dev ? '' : 's'}://${baseUrl}`;
    }
    return baseUrl;
};

const baseUrl = determineOrigin();

export const discord = new Discord(
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    `${baseUrl}/signin/discord/callback`
);

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, {
    redirectURI: `${baseUrl}/signin/github/callback`,
});

/**
 * Asserts user associated with an event is authenticated.  If they are not,
 * then it will redirect to the login page.
 *
 * This will also assert that `event.locals.user` is not null, so it can be used without annoyance:
 * ```ts
 * export const load: PageServerLoad = async (event) => {
 *     assertAuth(event); // Auth user
 *
 *     return {
 *         username: event.locals.user.username, // There is no type error here for accessing `username`
 *     };
 * };
 * ```
 */
export function assertAuth(event: {
    cookies: Cookies;
    locals: App.Locals;
    url: URL;
}): asserts event is typeof event & {
    locals: typeof event.locals & { user: NonNullable<typeof event.locals.user> };
} {
    if (!event.locals.user) {
        // redirect throws, so we don't need to return false.
        redirect(302, `/signin?redirect=${encodeURI(event.url.pathname)}`);
    }
}
