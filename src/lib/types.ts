import type { User } from 'lucia';
import type { Comment } from './server/db/comments.sql';

/**
 * An alias for a string that hints to the developer that this is a uuid
 */
export type uuid = string;

export type Vote = 'UP' | 'DOWN';

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
    userVote: Vote | null;
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

// NOTE: This must match the contents of /static/theme/
export const themes = ['green', 'rose', 'blue'] as const;
export type Theme = typeof themes[number];
