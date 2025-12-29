"use client"

import { FolderContextType, FolderItem } from "@/utils/types";
import {  ReactNode, createContext, useContext, useEffect, useState } from "react"

const FolderContext = createContext<FolderContextType | undefined>(undefined);


export function FolderProvider({ children} : {children: ReactNode} ) {
    const[isOpen, setIsOpen] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFolder() {
      try {

        const res = await fetch('/api/folders', {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // const data: FolderItem[] = await res.json();
        const data = await res.json();
        console.log("Fetched folders:", data.folders);

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
      } finally {
        setLoading(false);
      }

    }

    fetchFolder();

  },[]);

  return (

    <FolderContext.Provider value={{ isOpen: isOpen, setIsOpen: setIsOpen, currentFolder: currentFolder!, setCurrentFolder, folders, setFolders, loading, setLoading }}>
        {children}
    </FolderContext.Provider>

  )

}

export function useFolderContext() {
    const context =  useContext(FolderContext);
    if (!context) {
        throw new Error("useFolderContext must be used within a FolderProvider");
    }
    return context;
}