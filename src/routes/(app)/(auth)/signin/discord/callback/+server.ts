import { getOrCreateUser } from '$lib/server/services/users';
import { discord, setSessionCookies } from '$lib/server/auth';
import { getDb } from '$lib/server';
import { OAuth2RequestError } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Response received from the `https://discord.com/api/users/@me` endpoint.
 *
 * @see <https://discord.com/developers/docs/resources/user>
 */
interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: number;
    public_flags: number;
    flags: number;
    accent_color: number;
    global_name: null;
    avatar_decoration_data: null;
    banner_color: '#09816b';
}

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

        const user = await getOrCreateUser(
            db,
            {
                discordId: BigInt(discordUser.id),
            },
            {
                discordId: BigInt(discordUser.id),
                username: discordUser.username,
                // TODO: Upload this to our own platform
                profileImage: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith('a_') ? 'gif' : 'png'}`,
            }
        );

        setSessionCookies(user, event.cookies);

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
