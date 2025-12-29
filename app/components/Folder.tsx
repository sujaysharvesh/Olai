"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Folder, Plus, Search, X, Trash2 } from "lucide-react";
import { useFolderContext } from "./FolderContext";

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
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set default folder on mount
  useEffect(() => {
    if (!currentFolder && folders.length > 0) {
      setCurrentFolder(folders[0]);
    }
  }, []);

  // Close dropdown when clicking outside
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter folders by search query

  const filteredFolders = (folders ?? []).filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle folder selection
  const handleSelectFolder = (folder: FolderItem) => {
    setCurrentFolder(folder);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Handle delete folder
  const handleDeleteFolder = (folderId: string) => {
    // Don't delete if it's the last folder
    if (folders.length === 1) {
      setDeleteConfirm(null);
      return;
    }

    // If deleting current folder, switch to first available folder
    if (currentFolder?.id === folderId) {
      const remainingFolders = folders.filter((f) => f.id !== folderId);
      setCurrentFolder(remainingFolders[0] || null);
    }

    setFolders(folders.filter((f) => f.id !== folderId));
    setDeleteConfirm(null);
  };

  // Handle create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: Date.now().toString(),
        name: newFolderName,
      };
      setFolders([...folders, newFolder]);
      setCurrentFolder(newFolder);
      setNewFolderName("");
      setIsCreating(false);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        <Folder className="w-4 h-4 text-neutral-600 dark: text-neutral-400" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[120px] truncate">
          {currentFolder?.name || "Select"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl z-50 border border-neutral-200 dark: border-neutral-700 overflow-hidden max-h-[600px] flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folders..."
                className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder: text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Folders List */}
          {!isCreating && (
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onMouseEnter={() => setHoveredFolderId(folder.id)}
                    onMouseLeave={() => setHoveredFolderId(null)}
                    className="relative group"
                  >
                    {/* Delete Confirmation */}
                    {deleteConfirm === folder.id ? (
                      <div className="px-4 py-3 text-sm text-red-600 dark: text-red-400 bg-red-50 dark:bg-red-950/20 flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-700">
                        <span className="text-xs font-medium">
                          Delete "{folder.name}"?
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            className="px-2 py-1 text-xs font-medium rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs font-medium rounded bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Folder Item */
                      <div
                        onClick={() => handleSelectFolder(folder)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 cursor-pointer ${
                          currentFolder?.id === folder.id
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-l-4 border-amber-500"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Folder className="w-5 h-5 flex-shrink-0 text-neutral-600 dark: text-neutral-400" />
                          <span className="truncate">{folder.name}</span>
                        </div>

                        {/* Delete Button - Changed from button to div */}
                        {(hoveredFolderId === folder.id ||
                          currentFolder?.id === folder.id) &&
                          folders.length > 1 && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(folder.id);
                              }}
                              className="flex-shrink-0 p-1.5 rounded hover:bg-red-100 dark: hover:bg-red-950/30 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-16 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p>No folders found</p>
                  <p className="text-xs mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          )}

          {/* Create New Folder Section */}
          {isCreating ? (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex-shrink-0">
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewFolderName("");
                  }
                }}
                placeholder="Folder name..."
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder: text-neutral-500 dark: placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewFolderName("");
                  }}
                  className="flex-1 px-3 py-2.5 text-sm font-medium rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-t border-neutral-200 dark: border-neutral-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Folder
            </button>
          )}
        </div>
      )}
    </div>
  );
}
