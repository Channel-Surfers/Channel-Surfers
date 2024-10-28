import { BUNNY_API_KEY } from '$env/static/private';
import { PUBLIC_LIBRARY_ID, PUBLIC_PREVIEW_HOST } from '$env/static/public';
import type { Post, NewPost } from '../db/posts.sql';

export type Video = {
    videoId: string;
    category?: string | null;
    collectionId?: string | null;
    videoLibraryId: string;
};

export type CreateVideoArgs = Post | NewPost | Omit<NewPost, 'videoId'>;
export interface IBunnyClient {
    createVideo(post: CreateVideoArgs): Promise<Video>;
}

export class BunnyClient implements IBunnyClient {
    constructor(
        private libraryId: string,
        private host: string,
        private API_KEY: string
    ) {}
    async createVideo(post: CreateVideoArgs): Promise<Video> {
        console.log(this.libraryId, this.host, this.API_KEY);
        const url = `https://video.bunnycdn.com/library/${this.libraryId}/videos`;
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                AccessKey: this.API_KEY,
            },
            body: JSON.stringify({ title: post.title }),
        };

        const res = await fetch(url, options);
        if (!res.ok) {
            throw new Error(`failed to create video: ${await res.text()}`);
        }
        const data = await res.json();
        return { videoId: data.guid, videoLibraryId: this.libraryId };
    }
}

export const bunnyClient = new BunnyClient(PUBLIC_LIBRARY_ID, PUBLIC_PREVIEW_HOST, BUNNY_API_KEY);
