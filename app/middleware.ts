import { NextRequest, NextResponse } from "next/server";
import { authLib } from "@/utils/auth";


export async function middleware(request: NextRequest) {
  const protectedPaths = ['/api/profile', '/api/notes'];

  const token = authLib.extractCookie(request.headers.get('cookie'));

  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if(isProtected) {
    if(!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = authLib.verifyToken(token);
    if(!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

  } else {
    if(token && authLib.verifyToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*'
  ]
};
