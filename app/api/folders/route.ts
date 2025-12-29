import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createFolder, getAllFolders } from "@/service/folderService";
import { NextRequest, NextResponse } from "next/server";

// GET /api/folders - Fetch all folders for the authenticated user
export async function GET(request: NextRequest): Promise<Response> {
    
    try {

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await getAllFolders(session.user.id);

        console.log("Fetched folders:", response);

        return NextResponse.json({ folders: response }, { status: 200 });

    
    } catch (err) {

        return NextResponse.json({ error: `Failed to fetch folders : ${err}` }, { status: 500 });
    }
}

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest): Promise<Response> {

    try {
  
      const session = await getServerSession(authOptions);

      const name = await request.json();
  
      if (!session || !session.user?.email) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const response = await createFolder(name, session.user.id);
      
      return NextResponse.json({ folder: response }, { status: 201 });  
  
  
    } catch(err) {
      return NextResponse.json({ error: `Failed to fetch notes : ${err}` }, { status: 500 });
    }
  
  
    
  }