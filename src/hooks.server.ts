import { dev } from '$app/environment';
import { updateLocals } from '$lib/server/auth';
import { sleep } from '$lib/util';
import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
    // Add artificial delay when in dev so we can see what the web requests will be like
    if (dev && env.DELAY) await sleep(+env.DELAY);
    await updateLocals(event);
    return resolve(event);
};
