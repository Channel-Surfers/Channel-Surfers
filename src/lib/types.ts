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
    user: UserChannelData;
    tags: string[];
    upvotes: number;
    downvotes: number;
    comments: number;
}

/**
 * Data required for the UserChannel component
 */
export interface UserChannelData {
    username: string;
    channel: string;
    avatar?: string;
}
