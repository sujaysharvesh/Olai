"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutProps {
  className?: string;
}

export default function Logout({ className }: LogoutProps) {
  return (
    <button
      onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
      className={
        className ||
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
      }
      title="Logout"
    >
      <LogOut className="w-4 h-4" />
      <span>Log out</span>
    </button>
  );
}