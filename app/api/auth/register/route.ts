import { registerUser } from "@/service/userService";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest): Promise<Response> {
    try {
        const { username, email, password } = await request.json();
        // console.log(username, email, password)

        const user = await registerUser(username, email, password);

        return NextResponse.json(
            {
                message: "User created successfully",
                user,
            },
            { status: 201 }
        );

    } catch (err: any) {
        console.error("REGISTER ERROR:", err);
        return NextResponse.json(
          { error: "Internal server error" + err.message },
          { status: 500 }
        );
      }
      
}