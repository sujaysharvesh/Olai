import { registerUser } from "@/service/userService";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest): Promise<Response> {
    try {
        const { username, email, password } = await request.json();

        const user = await registerUser(username, email, password);

        return NextResponse.json(
            {
                message: "User created successfully",
                user,
            },
            { status: 201 }
        );

    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Registration failed" },
            { status: 400 }
        );
    }
}