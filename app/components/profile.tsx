"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Logout from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

export default function Profile() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Get initials from user name
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return (parts[0][0] + (parts[1] ? [0] : "")).toUpperCase();
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = getInitials(session?.user?.name || "");

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full 
                   bg-gradient-to-br from-slate-500 to-slate-700 
                   text-white font-semibold text-sm 
                   hover:shadow-md transition"
        title={session?.user?.name || "User Profile"}
      >
        {initials}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 
                     bg-white dark:bg-neutral-800 
                     rounded-lg shadow-xl z-50 
                     border border-neutral-200 dark:border-neutral-700 
                     overflow-hidden
                     animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div
            className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700
                          bg-neutral-50 dark:bg-neutral-900"
          >
            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
              {session?.user?.email || "No email"}
            </p>
          </div>

          <div className="p-2 space-y-1">
            <div
              className="flex items-center justify-between 
                         px-3 py-1  rounded-md
                         hover:bg-neutral-100 dark:hover:bg-neutral-700
                         transition"
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Theme
              </span>
              <ThemeToggle />
            </div>
            <Logout
              className="w-full flex items-center gap-2
                         px-3 py-2 rounded-md text-sm font-medium
                         text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-950/20
                         transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
