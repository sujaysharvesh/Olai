"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useDeferredValue,
} from "react";
import ThemeToggle from "../components/ThemeToggle";
import TextBox from "../components/TextBoxProp";

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  width: number;
}

export default function FigmaCanvas() {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [zoomLevel, setZoomLevel] = useState(1);
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.25;

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning || e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (
        target.closest(".text-box-container") ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      const newBox: TextBox = {
        id: crypto.randomUUID(),
        x,
        y,
        text: "",
        width: 200,
      };

      setTextBoxes((prev) => {
        const filtered = prev.filter((box) => box.text.trim() !== "");
        return [...filtered, newBox];
      });

      setSelectedId(newBox.id);
    },
    [panOffset, isPanning, zoomLevel]
  ); // Added zoomLevel dependency

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Get mouse position relative to canvas
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate mouse position in canvas coordinates (before zoom)
      const canvasX = (mouseX - panOffset.x) / zoomLevel;
      const canvasY = (mouseY - panOffset.y) / zoomLevel;

      // Adjust zoom based on wheel direction
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta));

      // Calculate new pan offset to zoom toward mouse position
      const newPanOffsetX = mouseX - canvasX * newZoom;
      const newPanOffsetY = mouseY - canvasY * newZoom;

      setZoomLevel(newZoom);
      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
    },
    [zoomLevel, panOffset]
  );

  const handleTextChange = useCallback((id: string, text: string) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, text } : box))
    );
  }, []);

  const handleBoxDrag = useCallback(
    (e: React.MouseEvent, id: string) => {
      // If clicking on textarea, don't start dragging - allow text selection
      if ((e.target as HTMLElement).tagName === "TEXTAREA") {
        // Just select the box, don't start dragging
        setSelectedId(id);
        return;
      }

      if (e.button !== 0) return; // Only left click for dragging boxes

      e.preventDefault();
      e.stopPropagation();

      const box = textBoxes.find((b) => b.id === id);
      if (!box) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSelectedId(id);
      setDraggingId(id);
      setDragOffset({
        x: e.clientX - rect.left - box.x * zoomLevel - panOffset.x,
        y: e.clientY - rect.top - box.y * zoomLevel - panOffset.y,
      });
    },
    [textBoxes, zoomLevel, panOffset]
  );

  const handleSpaceDrag = useCallback(
    (e: React.MouseEvent) => {
      // Start panning on middle click (button 1) or right-click (button 2)
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        e.stopPropagation();

        setIsPanning(true);
        setPanStart({
          x: e.clientX - panOffset.x,
          y: e.clientY - panOffset.y,
        });
      }
    },
    [panOffset]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Handle box dragging
      if (draggingId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x =
          (e.clientX - rect.left - dragOffset.x - panOffset.x) / zoomLevel;
        const y =
          (e.clientY - rect.top - dragOffset.y - panOffset.y) / zoomLevel;

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
    [draggingId, dragOffset, isPanning, panStart, zoomLevel, panOffset]
  );

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setIsPanning(false);
  }, []);

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (
        e.key === "Backspace" &&
        textBoxes.find((b) => b.id === id)?.text === ""
      ) {
        e.preventDefault();
        setTextBoxes((prev) => prev.filter((box) => box.id !== id));
        setSelectedId(null);
      }
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    },
    [textBoxes]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const calculateFontSize = (baseSize: number) => {
    const calculated = baseSize;
    // Limit between 8px and 32px for readability
    return Math.max(8, Math.min(32, calculated));
  };

  const calculateMinHeight = (baseHeight: number) => {
    const calculated = baseHeight;
    // Limit between 20px and 80px
    return Math.max(20, Math.min(80, calculated));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedId) {
        e.preventDefault();
        setTextBoxes((prev) => prev.filter((box) => box.id !== selectedId));
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => handleMouseMove(e);
    const upHandler = () => handleMouseUp();

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", upHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Auto-resize textareas
  useEffect(() => {
    textBoxes.forEach((box) => {
      const textarea = document.querySelector(
        `[data-box-id="${box.id}"]`
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = Math.max(28, textarea.scrollHeight) + "px";
      }
    });
  }, [textBoxes]);

  // Reset panning on double-click canvas
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (canvasRef.current && target === canvasRef.current) {
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);
    }
  }, []);

  // return (
  //   <div className="flex h-screen flex-col">
  //     {/* Toolbar */}
  //     <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
  //       <div className="flex items-center gap-2">
  //         <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-sm font-bold text-white">
  //           T
  //         </div>
  //         <span className="text-sm font-medium text-neutral-700">
  //           Text Canvas
  //         </span>
  //       </div>
  //       <ThemeToggle />
  //     </div>

  //     {/* Canvas Container */}
  //     <div className="relative flex-1 overflow-hidden">
  //       {/* Background Grid - Separate from interactive layer */}
  //       <div
  //         className="absolute inset-0"
  //         style={{
  //           // backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
  //           backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
  //           backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
  //         }}
  //       />

  //       {/* Interactive Canvas Layer */}
  //       <div
  //         ref={canvasRef}
  //         onClick={handleCanvasClick}
  //         onMouseDown={handleSpaceDrag}
  //         onDoubleClick={handleDoubleClick}
  //         onWheel={handleWheel} // Added wheel handler
  //         onContextMenu={handleContextMenu}
  //         className={`absolute inset-0 ${
  //           isPanning ? "cursor-grabbing" : "cursor-crosshair"
  //         }`}
  //       >
  //         {/* Text Boxes Container - moves with panning AND scales with zoom */}
  //         <div
  //           style={{
  //             transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
  //             transformOrigin: "0 0",
  //             willChange: "transform",
  //           }}
  //         >
  //           {textBoxes.map((box) => (
  //             <TextBox
  //             key={box.id}
  //             id={box.id}
  //             x={box.x}
  //             y={box.y}
  //             text={box.text}
  //             isSelected={selectedId === box.id}
  //             isDragging={draggingId === box.id}
  //             onMouseDown={handleBoxDrag}
  //             onTextChange={handleTextChange}
  //             onTextKeyDown={handleTextKeyDown}
  //             onFocus={setSelectedId}
  //           />
  //             // <div
  //             //   key={box.id}
  //             //   data-box-id={box.id}
  //             //   className={`absolute text-box-container ${
  //             //     draggingId === box.id ? "cursor-grabbing" : "cursor-move"
  //             //   }`}
  //             //   style={{
  //             //     left: `${box.x}px`,
  //             //     top: `${box.y}px`,
  //             //     transform: draggingId === box.id ? "scale(1.02)" : "none",
  //             //     transition:
  //             //       draggingId === box.id ? "none" : "transform 0.1s ease",
  //             //     zIndex: selectedId === box.id ? 10 : 1,
  //             //   }}
  //             // >
  //             //   <div
  //             //     onMouseDown={(e) => handleBoxDrag(e, box.id)}
  //             //     className={`group relative rounded border bg-white dark:bg-[#57595B] shadow-sm ${
  //             //       selectedId === box.id
  //             //         ? "border-gray- shadow-md"
  //             //         : "border-neutral-300 dark:border-gray-600 hover:border-blue-300"
  //             //     }`}
  //             //   >
  //             //     {/* Selection indicator */}
  //             //     {/* {selectedId === box.id && (
  //             //       <div className="absolute -left-2 -top-2 h-4 w-4 border-2 border-white dark:border-gray-800 shadow" />
  //             //     )} */}

  //             //     <textarea
  //             //       data-box-id={box.id}
  //             //       autoFocus={selectedId === box.id}
  //             //       value={box.text}
  //             //       onChange={(e) => handleTextChange(box.id, e.target.value)}
  //             //       onKeyDown={(e) => handleTextKeyDown(e, box.id)}
  //             //       onFocus={() => setSelectedId(box.id)}
  //             //       placeholder="Type here..."
  //             //       className="w-[200px] resize-none bg-transparent p-2 text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none"
  //             //       style={{
  //             //         width: "100%",
  //             //         height: "auto",
  //             //         minHeight: `${calculateMinHeight(28)}px`,
  //             //         fontSize: `${calculateFontSize(14)}px`,
  //             //         lineHeight: "1.5",
  //             //       }}
  //             //       rows={1}
  //             //       onInput={(e) => {
  //             //         const target = e.target as HTMLTextAreaElement;
  //             //         target.style.height = "auto";
  //             //         target.style.height =
  //             //           Math.max(28, target.scrollHeight) + "px";
  //             //       }}
  //             //     />
  //             //   </div>
  //             // </div>
  //           ))}
  //         </div>

  //         {/* Empty state */}
  //         {textBoxes.length === 0 && (
  //           <div
  //             className="pointer-events-none absolute inset-0 flex items-center justify-center"
  //             style={{
  //               transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
  //               transformOrigin: "0 0",
  //             }}
  //           >
  //             <div className="text-center">
  //               <div className="mb-4 text-5xl text-neutral-300">+</div>
  //               <p className="text-lg text-neutral-500">
  //                 Click anywhere to add a text box
  //               </p>
  //               <div className="mt-4 text-sm text-neutral-400">
  //                 <p>• Scroll wheel to zoom in/out</p>
  //                 <p>• Right-click + drag to pan the canvas</p>
  //                 <p>• Double-click canvas to reset view</p>
  //                 <p>• Press Delete to remove selected box</p>
  //                 <p>• Ctrl + 0 to reset zoom</p>
  //               </div>
  //             </div>
  //           </div>
  //         )}

  //         {/* Panning indicator */}
  //         {isPanning && (
  //           <div className="pointer-events-none fixed bottom-4 right-4 rounded bg-black/80 px-3 py-2 text-xs text-white">
  //             Panning mode - Release to stop
  //           </div>
  //         )}

  //         {/* Zoom indicator */}
  //         <div className="pointer-events-none fixed bottom-4 left-4 rounded bg-black/80 px-3 py-2 text-xs text-white">
  //           Zoom: {Math.round(zoomLevel * 100)}%
  //         </div>
  //       </div>
  //     </div>

  //     {/* Status bar */}
  //     {/* <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-1 text-xs text-neutral-500">
  //       <div>
  //         {selectedId ? `Selected box at (${textBoxes.find(b => b.id === selectedId)?.x.toFixed(0)}, ${textBoxes.find(b => b.id === selectedId)?.y.toFixed(0)})` : 'No selection'}
  //       </div>
  //       <div>
  //         Boxes: {textBoxes.length} | Zoom: {Math.round(zoomLevel * 100)}% | Pan: ({panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)})
  //       </div>
  //     </div> */}
  //   </div>
  // );

  return (
    <div className="flex h-full flex-col bg-neutral-100 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b-2 border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-sm font-bold text-white">
            T
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            Text Space
          </span>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto">
        
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-4xl text-neutral-300 dark:text-neutral-600">
              +
            </div>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Click anywhere to add a note
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
