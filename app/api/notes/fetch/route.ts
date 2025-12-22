import { getAllNotes } from "@/db/querie/noteQuerie";
import { authLib } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest, response: NextResponse) {
    try {
      const user = authLib.extractCookie(request.headers.get('cookie'));
      const payload = user ? authLib.verifyToken(user) : null;

      if (!payload?.id) {
        throw new Error("User not authenticated");
      }

      const response = await getAllNotes(payload?.id);
  
      return NextResponse.json({ response }, { status: 200 });
      
    } catch(err) {
      return NextResponse.json({ error: `Failed to sync notes : ${err}` }, { status: 500 });
    }
  }