/**
 * An alias for a string that hints to the developer that this is a uuid
 */
export type uuid = string;

/**
 * Data required for the Post component
 */
export interface PostData {
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
