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
    async createVideo(_post: Post): Promise<Video> {
        throw new Error('unimplemented');
    }
}
