"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Folder, Plus, X, Trash2 } from "lucide-react";
import { useFolderContext } from "./FolderContext";
import { DeleteFolderApi, createFolderAPI } from "../dashboard/createFolder";

interface FolderItem {
  id: string;
  name: string;
}

export default function FolderDropdown() {
  const {
    isOpen,
    setIsOpen,
    currentFolder,
    setCurrentFolder,
    folders,
    setFolders,
  } = useFolderContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentFolder && folders.length > 0) {
      setCurrentFolder(folders[0]);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setIsCreating(false);
        setDeleteConfirm(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredFolders = (folders ?? []).filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFolder = (folder: FolderItem) => {
    setCurrentFolder(folder);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (folders.length === 1) {
      setDeleteConfirm(null);
      return;
    }

    try {
      await DeleteFolderApi(folderId);
      
      if (currentFolder?.id === folderId) {
        const remainingFolders = folders.filter((f) => f.id !== folderId);
        setCurrentFolder(remainingFolders[0] || null);
      }

      setFolders(folders.filter((f) => f.id !== folderId));
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const response = await createFolderAPI(newFolderName);
        const newFolder: FolderItem = {
          id: response.id || Date.now().toString(),
          name: newFolderName,
        };
        setFolders([...folders, newFolder]);
        setCurrentFolder(newFolder);
        setNewFolderName("");
        setIsCreating(false);
        setIsOpen(false);
        setSearchQuery("");
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Minimal Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center bg-white rounded-md gap-2 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
      >
        <Folder className="w-4 h-4" />
        <span className="truncate max-w-[140px]">
          {currentFolder?.name || "Folder"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-neutral-900 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50">
          {/* Search */}
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search folders..."
              className="w-full px-3 py-2 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {/* Folders List */}
          <div className="max-h-52 overflow-y-auto">
            {filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => (
                <div key={folder.id}>
                  {deleteConfirm === folder.id ? (
                    <div className="px-3 py-2.5 text-sm bg-red-50 dark:bg-red-900/10 flex items-center justify-between">
                      <span className="text-red-600 dark:text-red-400">Delete folder?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="px-2 py-0.5 text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-0.5 text-sm text-neutral-500 hover:underline"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleSelectFolder(folder)}
                      className={`group flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                        currentFolder?.id === folder.id
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Folder className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      
                      {folders.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(folder.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-opacity"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-neutral-400">
                No folders
              </div>
            )}
          </div>

          {/* Create Folder */}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            {isCreating ? (
              <div className="p-3 flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") {
                      setIsCreating(false);
                      setNewFolderName("");
                    }
                  }}
                  placeholder="Folder name..."
                  className="flex-1 px-3 py-2 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                />
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewFolderName("");
                  }}
                  className="px-2 py-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2.5 px-3 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New folder</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}