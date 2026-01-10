"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useZoomContext } from "../components/zoomContext";

export default function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoomContext();

  return (
    <div
      className="
        inline-flex items-center
        rounded-2xl
        bg-white/80 dark:bg-neutral-900/80
        backdrop-blur-xl
        border border-neutral-200/50 dark:border-neutral-700/50
        shadow-lg shadow-neutral-900/5 dark:shadow-black/20
        px-1.5 py-1.5
        gap-1
      "
    >
      <SegmentButton
        onClick={zoomOut}
        title="Zoom out"
      >
       <ZoomOut className="h-4.5 w-4.5 opacity-60 dark:opacity-50" />
      </SegmentButton>

      <button
        onClick={resetZoom}
        className="
          min-w-[90px]
          px-4 py-2.5
          rounded-xl
          text-sm font-semibold tabular-nums
          bg-gradient-to-b from-neutral-50 to-neutral-100
          dark:from-neutral-800 dark:to-neutral-850
          text-neutral-900 dark:text-neutral-100
          border border-neutral-200/50 dark:border-neutral-700/30
          shadow-sm
          focus:outline-none
        "
        title="Reset to 100%"
      >
        <span className="flex items-center justify-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5 opacity-50" />
          {Math.round(zoom * 100)}%
        </span>
      </button>

      <SegmentButton
        onClick={zoomIn}
        title="Zoom in"
      >
        <ZoomIn className="h-4.5 w-4.5 opacity-60 dark:opacity-50" />
      </SegmentButton>
    </div>
  );
}


function SegmentButton({
  children,
  onClick,
  title,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="
        flex items-center justify-center
        h-10 w-10
        rounded-xl
        bg-gradient-to-b from-neutral-50 to-neutral-100
        dark:from-neutral-800 dark:to-neutral-850
        text-neutral-700 dark:text-neutral-300
        border border-transparent
        disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none
      "
    >
      {children}
    </button>
  );
}
