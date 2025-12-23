import { getAllNotes } from "@/db/querie/noteQuerie";
import { authLib } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";


export async function GET(request: NextRequest): Promise<Response> {
    try {

      const session = await getServerSession(authOptions);

      if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // const user = authLib.extractCookie(request.headers.get('cookie'));
      // const payload = user ? authLib.verifyToken(user) : null;

      // if (!payload?.id) {
      //   throw new Error("User not authenticated");
      // }

      const response = await getAllNotes(session.user.id);
  
      return NextResponse.json({ response }, { status: 200 });
      
    } catch(err) {
      return NextResponse.json({ error: `Failed to sync notes : ${err}` }, { status: 500 });
    }
  }