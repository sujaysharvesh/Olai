"use client";

import { useState } from "react";
import type { TextBox } from "@/utils/types";

// export function NoteSync(notes: TextBox[]) {
//   const lastSynced = useRef<TextBox[]>(notes);

//   console.log("NoteSync initialized with notes:", notes);

//   //   useEffect(() => {
//   //     const interval = setInterval(async () => {
//   //       if (JSON.stringify(lastSynced.current) === JSON.stringify(notes)) {
//   //         return;
//   //       }

//   //       lastSynced.current = notes;

//   //       await fetch("/api/notes/sync", {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         body: JSON.stringify({ notes }),
//   //       });
//   //     }, 1000);

//   //     return () => clearInterval(interval);
//   //   }, [notes]);

//   const handleSync = async () => {
//     const response = await fetch("/api/notes/sync", {
//       method: "POST",
//       headers: {
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ notes }),
//     });
    
//     console.log("Sync response:", response);

//     if (response.ok) {
//       console.log("Notes synced successfully");
//     } else {
//       console.error("Failed to sync notes");
//     }

//   };

//   return (
//     <div>
//       <button
//         onClick={handleSync}
//         className="rounded-lg bg-slate-950 text-lime-200"
//       >
//         Async
//       </button>
//     </div>
//   );
// }
interface NoteSyncProps {
    notes: TextBox[];
    folderId?: string;
  }
  
  export function NoteSync({ notes, folderId }: NoteSyncProps) {
    const [isSyncing, setIsSyncing] = useState(false);
  
    const handleSync = async () => {
      if (isSyncing) return;
  
      try {
        setIsSyncing(true);

        console.log("notes", notes)
        console.log("folderId", folderId)

  
        const response = await fetch(`/api/notes/sync?folderId=${folderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        });

        if (response.ok) {
          // console.log("Notes synced successfully");
        } else {
          // console.error("Failed to sync notes");
        }
      } catch (error) {
        // console.error("Sync error:", error);
      } finally {
        setIsSyncing(false);
      }
    };
  
    return (
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="rounded-lg bg-white text-black px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSyncing ? "Save..." : "Save"}
      </button>
    );
  }