import { error, json } from '@sveltejs/kit';
import { Type, type Static } from '@sinclair/typebox';
import type { RequestHandler } from './$types';
import { Value } from '@sinclair/typebox/value';

const followRequestBody = Type.Object({
    userId: Type.String(),
    followerId: Type.String(),
});
export type FollowRequestBody = Static<typeof followRequestBody>;
export const POST: RequestHandler = async ({ request }) => {
    let followRequest: FollowRequestBody;
    try {
        followRequest = Value.Parse(followRequestBody, request.body);
    } catch (e: unknown) {
        if (e instanceof Error) {
            return error(400, json([...Value.Errors(followRequestBody, request.body)]));
        }
    }
    return json({});
};
