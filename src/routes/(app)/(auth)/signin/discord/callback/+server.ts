import { getOrCreateUser } from '$lib/server/services/users';
import { discord, setSessionCookies } from '$lib/server/auth';
import { getDb } from '$lib/server';
import { OAuth2RequestError } from 'arctic';
import type { RequestHandler } from './$types';

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

export const GET: RequestHandler = async (event) => {
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

        await setSessionCookies(user, event.cookies);

        // This cookie should expire soon, but might as well delete it since we're done
        event.cookies.delete('discord_oauth_state', { path: '/' });

        let redirect = '/';
        if (event.cookies.get('redirect_after_auth')) {
            redirect = event.cookies.get('redirect_after_auth')!;
            event.cookies.delete('redirect_after_auth', { path: '/' });
        }

        return new Response(null, {
            status: 302,
            headers: {
                Location: redirect,
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
};
