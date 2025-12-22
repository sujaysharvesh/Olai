import { loginUser, registerUser } from "@/service/userService";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const res = await loginUser(email, password);

    console.log("Login successful:", res);

    const response = NextResponse.json(res, { status: 200 });
    response.cookies.set("token", res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    })

    return response;

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 400 }
    );
  }
}
