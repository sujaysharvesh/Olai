import { useEffect, useRef } from "react";


export async function noteSync(notes: TextBox[]) {
    const lastSynced = useRef(notes);

    useEffect(() => {

        const intervel = setInterval(async () => {
            if (JSON.stringify(lastSynced.current) === JSON.stringify(notes)) {
                return;
            }
            
            await fetch("/api/notes/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ notes }),
            } )
        }, 3000)

        return clearInterval(intervel);

    }, [notes]);

} 