import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { discord } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
    const state = generateState();
    const url = await discord.createAuthorizationURL(state, {
        scopes: ['identify'],
    });

    event.cookies.set('discord_oauth_state', state, {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
    });

    if (event.url.searchParams.has('redirect')) {
        event.cookies.set('redirect_after_auth', event.url.searchParams.get('redirect')!, {
            path: '/',
            secure: import.meta.env.PROD,
            httpOnly: true,
            maxAge: 60 * 10,
            sameSite: 'lax',
        });
    }

    redirect(302, url.toString());
};
