import { updateNotes } from "@/service/noteService";
import { authLib } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest, response: NextResponse) {
    try {
      const user = authLib.extractCookie(request.headers.get('cookie'));
      const payload = user ? authLib.verifyToken(user) : null;

      if (!payload?.id) {
        throw new Error("User not authenticated");
      }
  
      const { notes } = await request.json();
  
      await updateNotes(notes, payload?.id);
  
      return NextResponse.json({ message: "Notes synced successfully" }, { status: 200 });
      
    } catch(err) {
      return NextResponse.json({ error: `Failed to sync notes : ${err}` }, { status: 500 });
    }
  }

