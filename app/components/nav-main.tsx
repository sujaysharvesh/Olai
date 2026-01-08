"use client";

import {
  ChevronRight,
  Folder,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/app/components/ui/sidebar";

import { useFolderContext } from "./FolderContext";
import { useEffect, useRef, useState } from "react";
import { createFolderAPI, DeleteFolderApi } from "../dashboard1/createFolder";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    id: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { isMobile } = useSidebar();
  const { setCurrentFolder } = useFolderContext();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  const createFolderRef = useRef<HTMLDivElement | null>(null);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreatingFolder(false);
      return;
    }

    try {
      await createFolderAPI(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (items.length === 1) {
      setDeletingFolderId(null);
      return;
    }

    try {
      await DeleteFolderApi(folderId);
      setDeletingFolderId(null);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting folder:", error);
      setDeletingFolderId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateFolder();
    } else if (e.key === "Escape") {
      setIsCreatingFolder(false);
      setNewFolderName("");
    }
  };

  // Close input when clicking outside
  useEffect(() => {
    if (!isCreatingFolder) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        createFolderRef.current &&
        !createFolderRef.current.contains(event.target as Node)
      ) {
        setIsCreatingFolder(false);
        setNewFolderName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreatingFolder]);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center justify-between w-full">
            <span>Folders</span>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 hover:bg-accent rounded-md transition-colors"
              title="Create new folder"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </SidebarGroupLabel>

        <SidebarMenu>
          {isCreatingFolder && (
            <SidebarMenuItem>
              <div
                ref={createFolderRef}
                className="relative flex items-center gap-1 px-2 py-1.5"
              >
                <div className="p-1">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </div>

                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="New folder name..."
                  className="flex-1 bg-transparent border-none outline-none text-sm px-1 py-0.5 placeholder:text-muted-foreground"
                  autoFocus
                />

                <button
                  onClick={handleCreateFolder}
                  className="p-1 hover:bg-accent rounded-md transition-colors"
                  title="Create folder"
                  disabled={!newFolderName.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </SidebarMenuItem>
          )}

          {/* Existing Folders */}
          {items.map((item) => (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={(e) => {
                      if (
                        !(e.target as HTMLElement).closest(".chevron-trigger") &&
                        !(e.target as HTMLElement).closest(".delete-trigger")
                      ) {
                        setCurrentFolder({
                          id: item.id,
                          name: item.title,
                        });
                      }
                    }}
                    className="group/folder"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    <div className="ml-auto flex items-center gap-1">
  {items.length > 1 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setDeletingFolderId(item.id);
      }}
      className="delete-trigger opacity-0 group-hover/folder:opacity-100 p-1 hover:bg-accent rounded-sm transition-all flex items-center justify-center"
      title="Delete folder"
    >
      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
    </button>
  )}

<ChevronRight
  className="
    chevron-trigger
    h-5 w-5
    text-muted-foreground
    opacity-70
    transition-transform duration-200
    group-data-[state=open]/collapsible:rotate-90
  "
/>

</div>

                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton>
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Delete Confirmation Modal */}
      {deletingFolderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background rounded-lg p-6 max-w-sm mx-4 border shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              Delete Folder?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this folder? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingFolderId(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFolder(deletingFolderId)}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}