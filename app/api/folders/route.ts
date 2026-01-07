import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { FolderService } from "@/service/folderService";
import pool from "@/db/postgres";

// GET /api/folders - Fetch all folders for the authenticated user
// export async function GET(request: NextRequest): Promise<Response> {
    
//     try {

//         const session = await getServerSession(authOptions);
//         if (!session || !session.user?.email) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const response = await FolderService.getAllFolders(session.user.id);

//         return NextResponse.json({ folders: response }, { status: 200 });

    
//     } catch (err) {

//         return NextResponse.json({ error: `Failed to fetch folders : ${err}` }, { status: 500 });
//     }
// }

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest): Promise<Response> {

    try {
  
      const session = await getServerSession(authOptions);

      const name = await request.json();
  
      if (!session || !session.user?.email) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const response = await FolderService.createFolder(name, session.user.id);
      
      return NextResponse.json({ folder: response }, { status: 201 });  
  
  
    } catch(err) {
      return NextResponse.json({ error: `Failed to fetch notes : ${err}` }, { status: 500 });
    }
    
  }


export async function DELETE(request: NextRequest): Promise<Response> {

    try {

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const folderId = request.nextUrl.searchParams.get("folderId");
        // console.log("Deleting folder with ID:", folderId);
        const response = FolderService.deleteFolderById(folderId!);
        

        return NextResponse.json({ message: "Folder Deleted" }, { status: 200 });
    } catch(err) {
        return NextResponse.json({ error: `Failed to delete folder : ${err}` }, { status: 500 });
    }

}

export async function GET(request: NextRequest) : Promise<Response> {
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const userId = session.user.id;
  
    const query = `
      SELECT
        f.id   AS folder_id,
        f.name AS folder_name,
        n.id   AS note_id,
        n.title AS note_title
      FROM folders f
      LEFT JOIN notes n ON n.folder_id = f.id
      WHERE f.user_id = $1
      ORDER BY f.created_at, n.created_at
    `;
  
    const { rows } = await pool.query(query, [userId]);
  
    // 🔁 group notes under folders
    const foldersMap: Record<string, any> = {};
  
    for (const row of rows) {
      if (!foldersMap[row.folder_id]) {
        foldersMap[row.folder_id] = {
          title: row.folder_name,
          id: row.folder_id,
          items: [],
        };
      }
  
      if (row.note_id) {
        foldersMap[row.folder_id].items.push({
          title: row.note_title || "Untitled",
        });
      }
    }
  
    return NextResponse.json(Object.values(foldersMap));
  }