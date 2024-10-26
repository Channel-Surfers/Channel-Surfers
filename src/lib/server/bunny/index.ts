import { BUNNY_API_KEY } from '$env/static/private';
import { PUBLIC_LIBRARY_ID, PUBLIC_PREVIEW_HOST } from '$env/static/public';
import type { Post } from '../db/posts.sql';

export type Video = {
    videoId: string;
    category?: string | null;
    collectionId: string | null;
    videoLibraryId: string;
};

export interface IBunnyClient {
    createVideo(post: Post): Promise<Video>;
}

export class BunnyClient implements IBunnyClient {
    constructor(
        private libraryId: string,
        private host: string,
        private API_KEY: string
    ) {}
    async createVideo(_post: Post): Promise<Video> {
        console.log(this.libraryId, this.host, this.API_KEY);
        throw new Error('unimplemented');
    }
}

export const bunnyClient = new BunnyClient(PUBLIC_LIBRARY_ID, PUBLIC_PREVIEW_HOST, BUNNY_API_KEY);
