"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import TextBox from "../components/TextBoxProp";
import { useRouter } from "next/navigation";
import { NoteSync } from "./noteSync";
import { fetchNotes } from "./fetchNotes";
import { useSession } from "next-auth/react";
import FolderDropdown from "../components/Folder";
import Profile from "../components/profile";
import { useFolderContext } from "../components/FolderContext";
import { useZoomContext } from "../components/zoomContext";
import ZoomControls from "./zoomController";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";
import { BOX_COLORS } from "./boxColors";

interface TextBox {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
}

// Helper function to get color options as an array
const getColorOptions = () => {
  return Object.entries(BOX_COLORS).map(([name, colors]) => ({
    name,
    ...colors
  }));
};

export default function Canvas() {
  const { data: session, status } = useSession();
  const { isOpen: isFolderOpen } = useFolderContext();
  const {
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    zoomIn,
    zoomOut,
    resetZoom,
    ZOOM_STEP,
    MIN_ZOOM,
    MAX_ZOOM,
  } = useZoomContext();

  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [didDrag, setDidDrag] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const router = useRouter();
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { currentFolder, loading: foldersLoading } = useFolderContext();

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isResizingRef = useRef(false);

  // Track different loading states
  const [appState, setAppState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Get color options array
  const colorOptions = getColorOptions();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  
    if (status === "loading" || foldersLoading) {
      setAppState('loading');
      return;
    }
    
    if (status === "authenticated" && !foldersLoading) {
      // Check if we have a current folder
      if (!currentFolder) {
        setAppState('loading');
        return;
      }
      setAppState('ready');
    }
  }, [status, router, foldersLoading, currentFolder]);

  useEffect(() => {
    if (appState !== 'ready' || !currentFolder?.id) {
      if (!currentFolder?.id) {
        setTextBoxes([]);
      }
      return;
    }
  
    const LoadNotes = async () => {
      try {
        const boxes = await fetchNotes(currentFolder.id);
        setTextBoxes(boxes);
      } catch (err) {
        console.error("Error loading notes:", err);
        setError("Failed to load notes");
      }
    };
  
    LoadNotes();
  }, [appState, currentFolder?.id]);

  // Handle canvas click to add new text box
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current || isPanning || e.button !== 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    const newBox: TextBox = {
      id: uuidv4(),
      title: "",
      color: "Amber",
      x,
      y,
      text: "",
      width: 200,
      height: 28,
    };

    setTextBoxes((prev) => [...prev, newBox]);
    setEditingId(newBox.id);
    setSelectedId(newBox.id);
  };

  // Handle text change
  const handleTextChange = (id: string, text: string) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, text } : box))
    );
  };

  // Handle box click
  const handleBoxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (didDrag || isResizing || isResizingRef.current) {
      return;
    }

    setSelectedId(id);
    setEditingId(id);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") {
      setSelectedId(id);
      setEditingId(id);
      return;
    }

    if (e.button !== 0) return;

    e.stopPropagation();
    const box = textBoxes.find((b) => b.id === id);
    if (!box) return;

    setSelectedId(id);
    setDraggingId(id);
    setDidDrag(false);
    setIsResizing(false);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - box.x * zoom - panOffset.x,
      y: e.clientY - rect.top - box.y * zoom - panOffset.y,
    });
  };

  // Handle panning start
  const handleSpaceDrag = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      e.stopPropagation();

      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isFolderOpen) {
      return;
    }
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate mouse position in canvas coordinates (before zoom)
    const canvasX = (mouseX - panOffset.x) / zoom;
    const canvasY = (mouseY - panOffset.y) / zoom;

    // Adjust zoom based on wheel direction
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

    // Calculate new pan offset to zoom toward mouse position
    const newPanOffsetX = mouseX - canvasX * newZoom;
    const newPanOffsetY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingId) {
        const deltaX = (e.clientX - resizeStart.x) / zoom;
        const deltaY = (e.clientY - resizeStart.y) / zoom;

        const newWidth = Math.max(120, resizeStart.width + deltaX);
        const newHeight = Math.max(28, resizeStart.height + deltaY);

        setTextBoxes((prev) =>
          prev.map((box) =>
            box.id === resizingId
              ? { ...box, width: newWidth, height: newHeight }
              : box
          )
        );
        return;
      }

      // Handle dragging
      if (draggingId && canvasRef.current) {
        setDidDrag(true);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - dragOffset.x - panOffset.x) / zoom;
        const y = (e.clientY - rect.top - dragOffset.y - panOffset.y) / zoom;

        setTextBoxes((prev) =>
          prev.map((box) => (box.id === draggingId ? { ...box, x, y } : box))
        );
      }

      // Handle panning
      if (isPanning) {
        const newPanOffset = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        setPanOffset(newPanOffset);
      }
    },
    [
      draggingId,
      dragOffset,
      isPanning,
      panStart,
      zoom,
      panOffset,
      resizingId,
      resizeStart,
    ]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setIsPanning(false);
    setResizingId(null);

    setTimeout(() => {
      setDidDrag(false);
      setIsResizing(false);
      isResizingRef.current = false;
    }, 50);
  }, []);

  // Close popover
  const closePopover = () => {
    setTextBoxes((prev) =>
      prev.filter((box) => box.id !== editingId || box.text.trim() !== "")
    );
    setEditingId(null);
  };

  // Handle key down for escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closePopover();
    }
  };

  // Handle text key down for delete
  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (
        e.key === "Backspace" &&
        textBoxes.find((b) => b.id === id)?.text === ""
      ) {
        e.preventDefault();
        setTextBoxes((prev) => prev.filter((box) => box.id !== id));
        setSelectedId(null);
        setEditingId(null);
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setEditingId(null);
      }
    },
    [textBoxes]
  );

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Handle double click to reset view
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (canvasRef.current && target === canvasRef.current) {
      setPanOffset({ x: 0, y: 0 });
      setZoom(1);
    }
  }, []);

  const handleColorChange = (id: string, color: string) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, color } : box))
    );
  };

  // Focus textarea when editing
  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editingId]);

  // Add event listeners for mouse move and up
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Add delete key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        e.preventDefault();
        setTextBoxes((prev) => prev.filter((box) => box.id !== selectedId));
        setSelectedId(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  const handleTitleChange = (id: string, title: string) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, title } : box))
    );
  };

  const editingBox = textBoxes.find((b) => b.id === editingId);
  const gridSize = 20 * zoom;
  
  // FIXED: Get the correct color for the editing box
  const editingBoxColor = editingBox
    ? BOX_COLORS[editingBox.color as keyof typeof BOX_COLORS]
    : BOX_COLORS.Amber;

  useEffect(() => {
    const el = titleInputRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [editingBox?.title]);

  // Loading UI
  if (appState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[870px] rounded-lg flex-col bg-background">
      {/* Canvas Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Grid */}
        <div
          className="absolute bg-dots inset-0"
          style={{
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        />

        {/* Interactive Canvas Layer */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleSpaceDrag}
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          className={`absolute inset-0 ${
            isPanning ? "cursor-grabbing" : "cursor-crosshair"
          }`}
        >
          <div className="mt-10 px-10 justify-between flex">
            <div className="items-start">
              <FolderDropdown />
              <Profile/>
            </div>
            <div className="justify-between flex items-center gap-3">
              {currentFolder && (
                <NoteSync notes={textBoxes} folderId={currentFolder.id} />
              )}
            </div>
          </div>
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 backdrop-blur-sm">
              <ZoomControls />
            </div>
          </div>
          
          {/* Text Boxes Container */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: draggingId || isPanning || resizingId ? "none" : "transform 0.2s ease-out",
            }}
          >
            {textBoxes.map((box) => (
              <div
                key={box.id}
                className={`absolute ${
                  draggingId === box.id ? "cursor-grabbing" : "cursor-move"
                }`}
                style={{ left: box.x, top: box.y }}
                onMouseDown={(e) => handleMouseDown(e, box.id)}
                onClick={(e) => handleBoxClick(e, box.id)}
              >
                <TextBox
                  id={box.id}
                  title={box.title}
                  color={box.color}
                  x={0}
                  y={0}
                  text={box.text}
                  width={box.width}
                  height={box.height}
                  isSelected={selectedId === box.id}
                  isDragging={draggingId === box.id}
                  onMouseDown={(e) => handleMouseDown(e, box.id)}
                  onTextChange={handleTextChange}
                  onTextKeyDown={handleTextKeyDown}
                  onFocus={setSelectedId}
                />
              </div>
            ))}
            
            {/* Empty state */}
            {textBoxes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center mt-40 justify-center">
                <div className="text-center">
                  <div className="mb-4 text-5xl text-neutral-300 dark:text-neutral-600">
                    +
                  </div>
                  <p className="text-lg text-neutral-500 dark:text-neutral-400">
                    Click anywhere to add a text box
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Panning indicator */}
          {isPanning && (
            <div className="pointer-events-none fixed bottom-4 right-4 rounded bg-black/80 px-3 py-2 text-xs text-white">
              Panning mode - Release to stop
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
        <div className="flex items-center gap-4">
          <span>Boxes: {textBoxes.length}</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Edit Popover */}
      {editingId && editingBox && editingBoxColor && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closePopover}
        >
          <div
            className="relative w-full max-w-2xl mx-4 rounded-xl p-6 shadow-2xl"
            style={{
              backgroundColor: isDark ? editingBoxColor.dark.bg : editingBoxColor.light.bg,
              borderColor: isDark ? editingBoxColor.dark.border : editingBoxColor.light.border,
              color: isDark ? editingBoxColor.dark.text : editingBoxColor.light.text,
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopover}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-current opacity-60 transition-opacity hover:opacity-100"
            >
              ✕
            </button>

            <div className="relative">
              <textarea
                ref={titleInputRef}
                value={editingBox.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  if (newTitle.length <= 100) {
                    handleTitleChange(editingId, newTitle);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                placeholder="Add a title..."
                rows={1}
                className="
                  w-full
                  mb-3
                  bg-transparent
                  text-lg
                  font-semibold
                  placeholder:opacity-40
                  focus:outline-none
                  resize-none
                  leading-tight
                  break-words
                  whitespace-pre-wrap
                "
                style={{ overflow: "hidden" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
              />

              <textarea
                ref={textareaRef}
                value={editingBox.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  if (newText.length <= 1000) {
                    handleTextChange(editingId, newText);
                  }
                }}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  if (editingBox.text.length >= 1000) {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Tab",
                      "Escape",
                      "Enter",
                    ];

                    const isSelectAll =
                      e.key === "a" && (e.ctrlKey || e.metaKey);
                    const isCopyCut =
                      (e.key === "c" || e.key === "x") &&
                      (e.ctrlKey || e.metaKey);

                    if (
                      !allowedKeys.includes(e.key) &&
                      !isSelectAll &&
                      !isCopyCut &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData("text");
                  const currentText = editingBox.text;

                  const selectionStart = e.currentTarget.selectionStart;
                  const selectionEnd = e.currentTarget.selectionEnd;
                  const textBefore = currentText.substring(0, selectionStart);
                  const textAfter = currentText.substring(selectionEnd);

                  const newText = textBefore + pastedText + textAfter;

                  const finalText =
                    newText.length > 1000
                      ? textBefore +
                        pastedText.substring(
                          0,
                          1000 - textBefore.length - textAfter.length
                        ) +
                        textAfter
                      : newText;

                  handleTextChange(editingId, finalText);
                }}
                placeholder="Type your note here..."
                className="min-h-[300px] w-full resize-none bg-transparent text-base placeholder:text-current placeholder:opacity-40 focus:outline-none"
                maxLength={1000}
              />
            </div>
            
            <div className="mt-4 border-t border-current opacity-20 pt-4">
              <p className="text-xs font-semibold mb-2 opacity-60">Color</p>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() =>
                      handleColorChange(editingId, colorOption.name)
                    }
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      editingBox.color === colorOption.name
                        ? "border-current ring-2 ring-offset-1"
                        : "border-current opacity-40 hover:opacity-60"
                    }`}
                    style={{
                      backgroundColor: isDark 
                        ? colorOption.dark.bg 
                        : colorOption.light.bg,
                    }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-current opacity-20 px-2 pt-2">
              <span className="text-xs opacity-60">
                Press Escape to close
              </span>

              <button
                onClick={closePopover}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isDark 
                    ? editingBoxColor.dark.border 
                    : editingBoxColor.light.border,
                  color: isDark ? editingBoxColor.dark.text : editingBoxColor.light.text,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}