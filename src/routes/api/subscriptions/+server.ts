import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';

export async function POST({ request }: RequestEvent) {
    const data = await request.formData();
    const _channelId = data.get('channelId');
    switch (data.get('choice')) {
        case 'sub': {
            return json({ success: true, message: 'subscribed' });
        }
        case 'unsub': {
            return json({ success: true, message: 'unsubscribed' });
        }
        default: {
            return json({ success: false, message: 'unrecognized choice' });
        }
    }
}
