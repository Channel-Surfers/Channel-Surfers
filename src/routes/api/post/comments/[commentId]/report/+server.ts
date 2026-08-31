import { getDb } from '$lib/server';
import { type RequestHandler } from '@sveltejs/kit';
import { createUserReport } from '$lib/server/services/content';
import { userTable } from '$lib/server/db/users.sql';
import { eq } from 'drizzle-orm';
import { commentTable } from '$lib/server/db/comments.sql';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async (event) => {
    const db = await getDb();

    const data = await event.request.json();

    const user = await db
        .select({ id: userTable.id })
        .from(userTable)
        .innerJoin(commentTable, eq(commentTable.creatorId, userTable.id))
        .where(eq(commentTable.id, data.commentId));

    const theUserId = user[0].id;

    try {
        await createUserReport(db, {
            description: data.details,
            userId: theUserId,
            id: randomUUID(),
            status: 'INVESTIGATING',
            resolution: null,
            reporterId: null,
        });
    } catch (error) {
        if (error instanceof Error && error.cause === '23505') {
            throw new Error(`A report with this ID already exists. Please use a different ID.`);
        } else {
            throw error;
        }
    }

    return new Response(null, {
        status: 201,
    });
};
