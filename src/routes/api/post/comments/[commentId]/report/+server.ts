import { getDb } from "$lib/server";
import { loadMoreRepliesToComment } from "$lib/server/services/content";
import { json, type RequestHandler } from "@sveltejs/kit";
import { createUserReport, createPostReport } from '$lib/server/services/content';
import { userTable, } from "$lib/server/db/users.sql";
import { eq } from 'drizzle-orm';
import { commentTable } from "$lib/server/db/comments.sql";
import { Default } from "@sinclair/typebox/value";
import { description } from "valibot";
import { randomUUID } from 'crypto';

export const  POST: RequestHandler = async (event)  => {
    
    const db = await getDb();
    
    const data = await event.request.json();

    console.log(data);

    const user = await db
    .select({id:userTable.id})
    .from(userTable)
    .innerJoin(commentTable, eq(commentTable.creatorId, userTable.id))
    .where(eq(commentTable.id, data.commentId));

    const theUserId = (user[0].id);

    console.log(theUserId);

    try {
        await createUserReport(db, {
            description: data.details,
            userId: theUserId,
            id: randomUUID(), // This field is likely causing the duplicate key error
            status: "INVESTIGATING",
            resolution: null
        });
    } catch (error: any) {
        // Check for Postgres unique violation error code (23505)
        if (error.code === '23505') {
            throw new Error(`A report with this ID already exists. Please use a different ID.`);
        } else {
            // Rethrow other types of errors for further handling or debugging
            throw error;
        }
    }

    
    return new Response(null, {
        status: 201,
    });

};