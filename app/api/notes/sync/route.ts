import { updateNotes } from "@/service/noteService";
import { authLib } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest): Promise<Response> {
    try {

      const session = await getServerSession(authOptions);

      const folderId = request.nextUrl.searchParams.get("folderId");
      if(!folderId) {
        return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
      }
      

      if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }


      // const user = authLib.extractCookie(request.headers.get('cookie'));
      // const payload = user ? authLib.verifyToken(user) : null;

      // if (!payload?.id) {
      //   throw new Error("User not authenticated");
      // }
  
      const { notes } = await request.json();
  
      await updateNotes(notes, session.user.id, folderId);
  
      return NextResponse.json({ message: "Notes synced successfully" }, { status: 200 });
      
    } catch(err) {
      return NextResponse.json({ error: `Failed to sync notes : ${err}` }, { status: 500 });
    }
  }

