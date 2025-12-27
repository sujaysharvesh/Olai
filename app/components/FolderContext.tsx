"use client"

import { FolderContextType, FolderItem } from "@/utils/types";
import {  ReactNode, createContext, useContext, useState } from "react"

const FolderContext = createContext<FolderContextType | undefined>(undefined);


export function FolderProvider({ children} : {children: ReactNode} ) {
    const[isOpen, setIsOpen] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<FolderItem | null>(null);
     const [folders, setFolders] = useState<FolderItem[]>([
    { id: "1", name: "My Notes" },
    { id: "2", name: "Work" },
    { id: "3", name: "Personal" },
    { id: "4", name:  "Projects" },
    { id: "5", name:  "Ideas" },
  ]);

  return (

    <FolderContext.Provider value={{ isOpen: isOpen, setIsOpen: setIsOpen, currentFolder: currentFolder!, setCurrentFolder, folders, setFolders }}>
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