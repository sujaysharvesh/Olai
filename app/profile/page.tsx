"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CombinedCanvas() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return(
    <div>
        {session.user && (
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <div className="font-medium text-neutral-700 dark:text-neutral-200">
                  {session.user.id}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {session.user.email}
                </div>
              </div>
            </div>
          )}
    </div>
  )

}