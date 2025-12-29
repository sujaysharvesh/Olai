"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import TextBox from "../components/TextBoxProp";
import { useRouter } from "next/navigation";
import { NoteSync } from "./noteSync";
import { fetchNotes } from "./fetchNotes";
import { useSession } from "next-auth/react";
import FolderDropdown from "../components/Folder";
import Profile from "../components/profile";
import { useFolderContext } from "../components/FolderContext";
import { registerUser } from "@/service/userService";
import { useZoomContext } from "../components/zoomContext";
import ZoomControls from "../components/zoomController";

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
const BOX_COLORS = [
  {
    name: "Amber",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    dark: "dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
  },
  {
    name: "Red",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    dark: "dark:bg-red-950 dark:border-red-800 dark:text-red-100",
  },
  {
    name: "Blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    dark: "dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
  },
  {
    name: "Green",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    dark: "dark:bg-green-950 dark:border-green-800 dark:text-green-100",
  },
  {
    name: "Purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-900",
    dark: "dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
  },
  {
    name: "Pink",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-900",
    dark: "dark:bg-pink-950 dark:border-pink-800 dark:text-pink-100",
  },
];

export default function CombinedCanvas() {
  const { data: session, status } = useSession();
  const { isOpen: isFolderOpne } = useFolderContext();
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
  // const [loading, setLoading] = useState(true);
  const { currentFolder, loading: foldersLoading } = useFolderContext();

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isResizingRef = useRef(false);

   // Track different loading states
   const [appState, setAppState] = useState<'loading' | 'ready' | 'error'>('loading');
   const [error, setError] = useState<string | null>(null);
  // const currentFolder = useFolderContext().currentFolder;
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "loading" || foldersLoading) {
      setAppState('loading');
      return;
    }
    
    if (status === "authenticated" && !foldersLoading) {
      setAppState('ready');
    }

  }, [status, router, foldersLoading]);

  console.log("Current Folder ID:", currentFolder);

  useEffect(() => {
    if (appState !== 'ready' || !currentFolder?.id) return;

    const LoadNotes = async () => {
      const boxes = await fetchNotes(currentFolder.id);
      setTextBoxes(boxes);
      // setLoading(false);
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
      id: crypto.randomUUID(),
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

  // const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
  //   if (e.button !== 0) return;
  //   e.stopPropagation();
  //   e.preventDefault();
  //   isResizingRef.current = true;

  //   setIsResizing(true);

  //   const box = textBoxes.find((b) => b.id === id);
  //   if (!box) return;

  //   setResizingId(id);
  //   setResizeStart({
  //     x: e.clientX,
  //     y: e.clientY,
  //     width: box.width,
  //     height: box.height,
  //   });
  // };

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
    if (isFolderOpne) {
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
  const editingBoxColor = editingBox
    ? BOX_COLORS.find((c) => c.name === editingBox.color)
    : BOX_COLORS[0];

  useEffect(() => {
    const el = titleInputRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [editingBox?.title]);

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
    <div className="flex h-screen flex-col bg-neutral-100 dark:bg-neutral-900">
      {/* <div
        className="
    flex items-start justify-between
    border-b border-neutral-200/40 dark:border-neutral-700/40
    px-4 py-3
  "
        style={{
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-sm font-bold text-white shadow-sm">
            O
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-800 dark:text-white">
              Olai Canvas
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Modern note-keeping space
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 bg-white dark:bg-neutral-800">
            <button
              onClick={zoomOut}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="min-w-[52px] text-center">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              onClick={zoomIn}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-600 mx-1" />
            <button
              onClick={resetZoom}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-white"
              title="Reset Zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {session?.user.name?.split(" ")[0] || "User"}
                </span>
                <span className="mx-1">•</span>
                Online
              </div>
            </div>

            <div className="flex items-center gap-1">
              <NoteSync notes={textBoxes} />
            </div>
          </div>
        </div>
      </div> */}

      {/* Canvas Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Grid - FIXED */}
        <div
          className="absolute bg-dots inset-0"
          style={{
            // backgroundImage:
            //   "radial-gradient(circle, rgb(197, 187, 187) 1px, transparent 1px)",
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
          <div className="mt-10 px-10 justify-between  flex">
            <div className="items-start">
              <FolderDropdown />
            </div>
            <div className="items-end">
              <Profile />
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

                {/* Resize handle */}
                {/* {selectedId === box.id && (
                  <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => { return; handleResizeMouseDown(e, box.id)}
                    }
                    onClick={(e) => {
                      isResizingRef.current = true;
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  ></div>
                )} */}
              </div>
            ))}
            {/* Empty state - REMOVED instructions to fix click issue */}
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

      {/* Status bar - SIMPLIFIED */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
        <div>
          {selectedId
            ? `Selected box at (${textBoxes
                .find((b) => b.id === selectedId)
                ?.x.toFixed(0)}, ${textBoxes
                .find((b) => b.id === selectedId)
                ?.y.toFixed(0)})`
            : "No selection"}
        </div>
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
            className={`relative w-full max-w-2xl mx-4 rounded-xl p-6 shadow-2xl dark:bg-neutral-800 ${editingBoxColor.bg} ${editingBoxColor.border} ${editingBoxColor.text} ${editingBoxColor.dark}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopover}
              className="absolute right-3 top-3 bg-slate-100 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
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
                className="min-h-[300px] w-full resize-none bg-transparent text-base placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
                maxLength={1000}
              />
            </div>
            <div className="mt-4 border-t border-current opacity-20 pt-4">
              <p className="text-xs font-semibold mb-2 opacity-60">Color</p>
              <div className="flex gap-2 flex-wrap">
                {BOX_COLORS.map((colorOption) => (
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
                      backgroundColor:
                        colorOption.name === "Amber"
                          ? "#fef3c7"
                          : colorOption.name === "Red"
                          ? "#fee2e2"
                          : colorOption.name === "Blue"
                          ? "#dbeafe"
                          : colorOption.name === "Green"
                          ? "#dcfce7"
                          : colorOption.name === "Purple"
                          ? "#f3e8ff"
                          : "#fce7f3",
                    }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-200 px-2 pt-2 dark:border-neutral-700">
              <span className="text-xs text-neutral-400">
                Press Escape to close
              </span>

              <button
                onClick={closePopover}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
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
