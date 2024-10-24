import type { User } from 'lucia';
import type { Comment } from './server/db/comments.sql';
import { createKeys, type UnionToTuple } from './util';

/**
 * An alias for a string that hints to the developer that this is a uuid
 */
export type uuid = string;

/**
 * Data required for the Post component
 */
export interface PostData {
    id: uuid;
    title: string;
    videoId: uuid;
    createdOn: Date;
    poster: PosterData;
    tags: string[];
    upvotes: number;
    downvotes: number;
    comments: number;
}

export interface PosterData {
    user: UserData;
    channel: ChannelData;
}

export interface UserData {
    id: uuid;
    name: string;
    avatar?: string;
}

export interface ChannelData {
    id: uuid;
    name: string;
    private: boolean;
}

export interface CommentData {
    user: User;
    comment: Comment;
    children: CommentData[];
}

/**
 * Data used for creating a channel
 */
export interface CreateChannel {
    name: string;
    description?: string;
    guidelines?: string,
    bannerImage?: string,
    icon?: string,
    publishNow: boolean,
}
