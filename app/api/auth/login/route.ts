import { loginUser, registerUser } from "@/service/userService";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {

    try {

        const {email, password} = await request.json();

        const response = await loginUser(email, password);

        return NextResponse.json({
            message : "Login successful",
            status : 200
        })

    } catch(err) {
        return NextResponse.json(
            { error: err.message },
            { status: 400 }
        );
        }

}