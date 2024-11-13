import type { Comment } from './server/db/comments.sql';
import type { User } from './server/db/users.sql';

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

/**
 * Data used for creating a channel
 */
export interface CreateChannel {
    name: string;
    description?: string;
    guidelines?: string;
    bannerImage?: string;
    icon?: string;
    publishNow: boolean;
}

// NOTE: This must match the contents of /static/theme/
export const themes = [
    'zinc',
    'red',
    'rose',
    'orange',
    'green',
    'blue',
    'yellow',
    'violet',
] as const;
// These are all taken from shadcn-svelte's site: https://www.shadcn-svelte.com/themes
export const colours: Record<Theme, string> = {
    zinc: 'hsl(240 5.2% 33.9%)',
    red: 'hsl(0 72.2% 50.6%)',
    rose: 'hsl(346.8 77.2% 49.8%)',
    orange: 'hsl(20.5 90.2% 48.2%)',
    green: 'hsl(142.1 70.6% 45.3%)',
    blue: 'hsl(217.2 91.2% 59.8%)',
    yellow: 'hsl(47.9 95.8% 53.1%)',
    violet: 'hsl(263.4 70% 50.4%)',
};
export type Theme = (typeof themes)[number];
