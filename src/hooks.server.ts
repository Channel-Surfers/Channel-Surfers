import { updateLocals } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    await updateLocals(event);
    return resolve(event);
};
