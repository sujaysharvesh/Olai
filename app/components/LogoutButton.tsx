import { useRouter } from "next/navigation";


export default function Logout() {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            router.push('/login');
        } else {
            console.error('Logout failed');
        }
    }

    return (<div>
        <button onClick={handleLogout} className="rounded-lg bg-slate-400 text-lime-200">
            Logout
        </button>
    </div>)


}