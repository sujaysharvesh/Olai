import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

import { Session } from "next-auth";

export async function requireSession(): Promise<Session> {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        throw new Error("UNAUTHORIZED");
    }

    return session;
}
