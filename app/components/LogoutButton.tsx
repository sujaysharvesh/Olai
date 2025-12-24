import { useRouter } from "next/navigation";
import {signOut} from "next-auth/react";


export default function Logout() {
    const router = useRouter();

    const handleLogout = async () => {
        // const response = await fetch('/api/auth/logout', {
        //     method: 'POST',
        // });

        // if (response.ok) {
        //     router.push('/login');
        // } else {
        //     console.error('Logout failed');
        // }
        await signOut({ callbackUrl: "/login" });
    }

    return (<div>
       <button
  onClick={handleLogout}
  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-red-900/20 dark:hover:border-red-800/50 dark:hover:text-red-400 transition-all duration-200 font-medium text-xs sm:text-sm font-sans"
  title="Logout"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-3.5 w-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
  <span className="hidden sm:inline">Logout</span>
</button>
    </div>)


}