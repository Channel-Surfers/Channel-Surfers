import { getDb } from "$lib/server";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    await getDb();
    return new Response(null, {
        status: 200,
    });
};
