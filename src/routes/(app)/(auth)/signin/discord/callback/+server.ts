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
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const tokens = await discord.validateAuthorizationCode(code);

        // Get information about the user we just authenticated
        const discordUserResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const discordUser: DiscordUser = await discordUserResponse.json();

        const db = await getDb();

        let user = await Effect.runPromise(
            getUserByAuth(db, {
                discordId: BigInt(discordUser.id),
            })
        );

        const lucia = await getLucia();

        // if user doesn't exist, create one
        if (!user) {
            user = await Effect.runPromise(
                createUser(db, {
                    discordId: BigInt(discordUser.id),
                    username: discordUser.username,
                    // TODO: Upload this to our own platform
                    profileImage: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}`,
                })
            );
        }

        // Set session & cookies
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });

        // Redirect to '/'
        // TODO: Let the user continue to their target destination
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/',
            },
        });
    } catch (e) {
        console.error(e);
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
