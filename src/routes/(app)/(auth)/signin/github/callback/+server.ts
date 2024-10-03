import { createUser, getUserByAuth } from '$lib/server/services/users';
import { getDb } from '$lib/server';
import { github, getLucia } from '$lib/server/auth';
import { OAuth2RequestError } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
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
        const lucia = await getLucia();

        let user = await getUserByAuth(db, {
            githubId: githubUser.id,
        });

        // if user doesn't exist, create one
        if (!user) {
            user = await createUser(db, {
                githubId: githubUser.id,
                username: githubUser.login,
                // TODO: Upload this to our own platform
                profileImage: githubUser.avatar_url,
            });
        }

        // Set session & cookies
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: '.',
            ...sessionCookie.attributes,
        });

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

interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
}
