"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useZoomContext } from "./zoomContext";

export default function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoomContext();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 p-1.5 bg-white dark:bg-neutral-800">
      <button
        onClick={zoomOut}
        className="flex h-10 w-10 items-center justify-center rounded-md
                   text-neutral-600 dark:text-neutral-400
                   transition-colors
                   hover:bg-neutral-100 dark:hover:bg-neutral-700
                   hover:text-neutral-800 dark:hover:text-white"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>

      <div className="min-w-[56px] text-center">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <button
        onClick={zoomIn}
        className="flex h-10 w-10 items-center justify-center rounded-md
                   text-neutral-600 dark:text-neutral-400
                   transition-colors
                   hover:bg-neutral-100 dark:hover:bg-neutral-700
                   hover:text-neutral-800 dark:hover:text-white"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      <div className="h-5 w-px bg-neutral-300 dark:bg-neutral-600 mx-1.5" />

      <button
        onClick={resetZoom}
        className="flex h-10 w-10 items-center justify-center rounded-md
                   text-neutral-600 dark:text-neutral-400
                   transition-colors
                   hover:bg-neutral-100 dark:hover:bg-neutral-700
                   hover:text-neutral-800 dark:hover:text-white"
        title="Reset Zoom"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}
