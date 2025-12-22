
import { authLib } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function GET(request: NextRequest) {
    const user = authLib.extractCookie(request.headers.get('cookie'));
      
    const payload = user ? authLib.verifyToken(user) : null;    

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  
    return NextResponse.json({ userId: payload?.id, username: payload?.username });
  }
  