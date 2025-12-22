"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import TextBox from "../components/TextBoxProp";
import { useRouter } from "next/navigation";
import Logout from "../components/LogoutButton";
import { NoteSync } from "./noteSync";

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
}

export default function CombinedCanvas() {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [didDrag, setDidDrag] = useState(false);
  const [user, setUser] = useState<{ username: string; userId: string } | null>(
    null
  );
  const router = useRouter();

  const canvasRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  // Zoom functions
  const zoomIn = () => setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const resetZoom = () => setZoom(1);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        console.log("user page:", data);
        setUser({ username: data.username, userId: data.userId });
      } else {
        router.push("/login");
      }
    };

    fetchProfile();
  }, [router]);

  // NoteSync(textBoxes)

  // Handle canvas click to add new text box
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current || isPanning || e.button !== 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    const newBox: TextBox = {
      id: crypto.randomUUID(),
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
    if (didDrag) return;
    setSelectedId(id);
    setEditingId(id);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    // If clicking on textarea, don't start dragging
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

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - box.x * zoom - panOffset.x,
      y: e.clientY - rect.top - box.y * zoom - panOffset.y,
    });
  };

  // Handle resize mouse down
  const handleResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const box = textBoxes.find((b) => b.id === id);
    if (!box) return;

    setResizingId(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: box.width,
      height: box.height,
    });
  };

  // Handle panning start
  const handleSpaceDrag = (e: React.MouseEvent) => {
    // Start panning on middle click or right-click
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

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
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

  // Handle mouse move for dragging, resizing, and panning
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Handle resizing
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
    setTimeout(() => setDidDrag(false), 100);
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

  const editingBox = textBoxes.find((b) => b.id === editingId);

  return (
    <div className="flex h-screen flex-col bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-sm font-bold text-white">
            T
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Text Canvas Pro
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={resetZoom}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              title="Reset Zoom"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <span className="min-w-[60px] text-center text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <ThemeToggle />
        </div>
        <div>
          {user && (
            <div className="text-sm text-neutral-600 dark:text-neutral-300">
              Logged in as: {user.username}
            </div>
          )}
          <Logout />
           <NoteSync notes={textBoxes}/>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Click to add • Drag to move • Scroll to zoom • Right-drag to pan
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Grid */}
        <div
          className="absolute inset-0"
          style={{
            // backgroundImage:
            //   "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
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
          {/* Text Boxes Container */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              willChange: "transform",
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
                {selectedId === box.id && (
                  <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => handleResizeMouseDown(e, box.id)}
                  >
                    {/* <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4 text-neutral-400"
                      fill="currentColor"
                    >
                      <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
                    </svg> */}
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {textBoxes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-5xl text-neutral-300 dark:text-neutral-600">
                    +
                  </div>
                  <p className="text-lg text-neutral-500 dark:text-neutral-400">
                    Click anywhere to add a text box
                  </p>
                  <div className="mt-4 text-sm text-neutral-400 dark:text-neutral-500">
                    <p>• Scroll wheel to zoom in/out</p>
                    <p>• Right-click + drag to pan the canvas</p>
                    <p>• Double-click canvas to reset view</p>
                    <p>• Press Delete to remove selected box</p>
                    <p>• Use buttons or mouse wheel to zoom</p>
                  </div>
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

          {/* Zoom indicator */}
          <div className="pointer-events-none fixed bottom-4 left-4 rounded bg-black/80 px-3 py-2 text-xs text-white">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>

      {/* Status bar */}
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
        <div>
          Boxes: {textBoxes.length} | Zoom: {Math.round(zoom * 100)}% | Pan: (
          {panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)})
        </div>
      </div>

      {/* Edit Popover */}
      {editingId && editingBox && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closePopover}
        >
          <div
            className="relative w-full max-w-2xl mx-4 rounded-xl bg-white p-6 shadow-2xl dark:bg-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePopover}
              className="absolute right-3 top-3 bg-slate-100 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            >
              ✕
            </button>
            <textarea
              ref={textareaRef}
              value={editingBox.text}
              onChange={(e) => handleTextChange(editingId, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your note here..."
              className="min-h-[300px] w-full resize-none bg-transparent text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
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
