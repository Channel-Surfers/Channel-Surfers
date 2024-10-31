import { BUNNY_API_KEY } from '$env/static/private';
import { PUBLIC_LIBRARY_ID } from '$env/static/public';

export const createTUSUploadKey = async (expirationTime: number, videoId: string) => {
    const uint8Array = new TextEncoder().encode(
        PUBLIC_LIBRARY_ID + BUNNY_API_KEY + expirationTime + videoId
    );
    return Buffer.from(await crypto.subtle.digest('SHA-256', uint8Array)).toString('hex');
};
