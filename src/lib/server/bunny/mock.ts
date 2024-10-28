import { type IBunnyClient, type Video } from '.';
import type { Post } from '../db/posts.sql';

export class MockBunnyClient implements IBunnyClient {
    public calls = {
        createVideo: 0,
    };
    collectionId = '3ed153ab-1948-4868-991b-c707ec7c2e1d';
    videoLibraryId = '5cb43d5b-0f73-40a7-9444-4cef7f92cf8d';

    constructor() {}

    async createVideo(_post: Post): Promise<Video> {
        this.calls.createVideo++;
        return {
            videoId: '76dcef9d-2161-4706-a1a1-a87f20ad4504',
            collectionId: this.collectionId,
            videoLibraryId: this.videoLibraryId,
        };
    }
}