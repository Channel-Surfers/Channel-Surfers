import { OAuth2RequestError } from 'arctic';
import { discord, getLucia } from '$lib/server/auth';
import { createUser, getUserByAuth } from '$lib/server/services/users';
import type { RequestEvent } from '@sveltejs/kit';
import { getDb } from '$lib/server';
import { Effect } from 'effect';

export async function GET(event: RequestEvent): Promise<Response> {
    const code = event.url.searchParams.get('code');
    const state = event.url.searchParams.get('state');
    const storedState = event.cookies.get('discord_oauth_state') ?? null;

    if (!code || !state || !storedState || state !== storedState) {
        console.dir({ code, state, storedState });
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const tokens = await discord.validateAuthorizationCode(code);
        console.log({ tokens });
        const discordUserResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const discordUser: DiscordUser = await discordUserResponse.json();
        console.log({ discordUser });

        const discord_id = discordUser.id;

        const db = await getDb();

        // Replace this with your own DB client.
        const existingUser = await Effect.runPromise(
            getUserByAuth(db, { discordId: BigInt(discord_id) })
        );

        const lucia = await getLucia();
        if (existingUser) {
            const session = await lucia.createSession(existingUser.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        } else {
            // Replace this with your own DB client.
            const user = await Effect.runPromise(
                createUser(db, {
                    discordId: BigInt(discordUser.id),
                    username: discordUser.username,
                })
            );

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        }
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
            },
        });
    } catch (e) {
        console.error(e);
        // the specific error message depends on the provider
        if (e instanceof OAuth2RequestError) {
            // invalid code
            return new Response(null, {
                status: 400,
            });
        }
        return new Response(null, {
            status: 500,
        });
    }
}

interface DiscordUser {
    id: string;
    username: string;
    avatar: string; // 'a_71326fe1599c1756c0c84facb3887012'
    discriminator: number;
    public_flags: number;
    flags: number;
    accent_color: number;
    global_name: null;
    avatar_decoration_data: null;
    banner_color: '#09816b';
}
