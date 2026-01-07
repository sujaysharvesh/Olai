import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { FolderService } from "@/service/folderService";
import pool from "@/db/postgres";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest): Promise<Response> {
    
    try {

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await FolderService.getAllFolders(session.user.id);

        return NextResponse.json({ folders: response }, { status: 200 });

    
    } catch (err) {

        return NextResponse.json({ error: `Failed to fetch folders : ${err}` }, { status: 500 });
    }
}