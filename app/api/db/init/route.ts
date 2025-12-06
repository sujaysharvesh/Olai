import { initDB } from "@/lib/initDb";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    await initDB();
    return new Response("Database initialized");

} 