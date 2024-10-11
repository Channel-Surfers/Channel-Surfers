//import type { User } from "./server/db/users.sql";

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
    user: uuid; // may need to be User
    content: string;
    downvotes: number;
    upvotes: number;
    children?: CommentData[];
}
