"use client"

import { FolderContextType, FolderItem } from "@/utils/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react";

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      setFolders([]);
      setCurrentFolder(null);
      setLoading(false);
      return;
    }

    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "authenticated") {
      async function fetchFolder() {
        try {
          setLoading(true);
          const res = await fetch('/api/folders', {
            method: "GET",
            credentials: "include",
          })

          if (!res.ok) {
            if (res.status === 401) {
              console.log("Unauthorized - user may have logged out");
              setFolders([]);
              setCurrentFolder(null);
              return;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          // console.log("Fetched folders:", data.folders);

          const folders: FolderItem[] = data.folders.map((folder: any) => ({
            id: folder.id,
            name: folder.name
          }))

          setFolders(folders);

          if (folders.length > 0 && !currentFolder) {
            setCurrentFolder(folders[0]);
          }

          console.log("Current folder after fetch:", currentFolder);

        } catch (err) {
          console.error("Error fetching folders:", err);
          setFolders([]);
          setCurrentFolder(null);
        } finally {
          setLoading(false);
        }
      }

      fetchFolder();
    }
  }, [status]); 

  return (
    <FolderContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      currentFolder: currentFolder!, 
      setCurrentFolder, 
      folders, 
      setFolders, 
      loading, 
      setLoading 
    }}>
      {children}
    </FolderContext.Provider>
  )
}

export function useFolderContext() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolderContext must be used within a FolderProvider");
  }
  return context;
}