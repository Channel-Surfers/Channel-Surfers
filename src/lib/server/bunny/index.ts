import { BUNNY_API_KEY } from '$env/static/private';
import { PUBLIC_LIBRARY_ID } from '$env/static/public';
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
    deleteVideo(video: Video): Promise<boolean>;
    deleteVideo(videoId: string): Promise<boolean>;
}

export class BunnyClient implements IBunnyClient {
    constructor(
        private libraryId: string,
        private API_KEY: string
    ) {}
    async createVideo(post: CreateVideoArgs): Promise<Video> {
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
    async deleteVideo(video: Video): Promise<boolean>;
    async deleteVideo(videoId: string): Promise<boolean>;
    async deleteVideo(arg: Video | string): Promise<boolean> {
        const videoId = typeof arg === 'string' ? arg : arg.videoId;
        const url = `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`;
        const options = {
            method: 'DELETE',
            headers: { accept: 'application/json', AccessKey: this.API_KEY },
        };

        try {
            const res = await fetch(url, options);

            return res.ok;
        } catch (e) {
            console.error('error occured deleting video', e);
            return false;
        }
    }
}

export const bunnyClient = new BunnyClient(PUBLIC_LIBRARY_ID, BUNNY_API_KEY);
