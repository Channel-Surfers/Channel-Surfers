import { getOrCreateUser } from '$lib/server/services/users';
import { getDb } from '$lib/server';
import { github, setSessionCookies } from '$lib/server/auth';
import { OAuth2RequestError } from 'arctic';
import type { RequestHandler } from '../$types';

/**
 * Response received from the `https://api.github.com/user` endpoint.
 *
 * @see <https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28>
 */
interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
}

export const GET: RequestHandler = async (event) => {
    const code = event.url.searchParams.get('code');
    const state = event.url.searchParams.get('state');
    const storedState = event.cookies.get('github_oauth_state') ?? null;

    if (!code || !state || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);

        // Get information about the user we just authenticated
        const githubUserResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const githubUser: GitHubUser = await githubUserResponse.json();

        const db = await getDb();

        const user = await getOrCreateUser(
            db,
            {
                githubId: githubUser.id,
            },
            {
                githubId: githubUser.id,
                username: githubUser.login,
                // TODO: Upload this to our own platform
                profileImage: githubUser.avatar_url,
            }
        );

        await setSessionCookies(user, event.cookies);

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
