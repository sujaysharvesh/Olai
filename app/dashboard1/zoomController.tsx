"use client";

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useZoomContext } from "../components/zoomContext";
import { useTheme } from "next-themes";

export default function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoomContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerBg = isDark 
    ? "bg-neutral-900/90" 
    : "bg-white/80";
  
  const containerBorder = isDark 
    ? "border-neutral-700/70" 
    : "border-neutral-200/50";

  const buttonBg = isDark 
    ? "dark:from-neutral-800 dark:to-neutral-900" 
    : "from-white to-neutral-100";
  
  const buttonBorder = isDark 
    ? "border-neutral-700/50" 
    : "border-neutral-200/50";
  
  const buttonText = isDark 
    ? "text-neutral-100" 
    : "text-neutral-900";

  return (
    <div
      className={`
        inline-flex items-center
        rounded-2xl
        backdrop-blur-xl
        border
        shadow-lg shadow-neutral-900/5 dark:shadow-black/30
        px-1.5 py-1.5
        gap-1
        ${containerBg}
        ${containerBorder}
      `}
    >
      <SegmentButton
        onClick={zoomOut}
        title="Zoom out"
        isDark={isDark}
        buttonBg={buttonBg}
        buttonBorder={buttonBorder}
      >
        <ZoomOut className="h-4.5 w-4.5 opacity-60" />
      </SegmentButton>

      <button
        onClick={resetZoom}
        className={`
          min-w-[90px]
          px-4 py-2.5
          rounded-xl
          text-sm font-semibold tabular-nums
          bg-gradient-to-b
          border
          shadow-sm
          focus:outline-none
          transition-colors duration-150
          hover:${isDark ? "from-neutral-700 hover:to-neutral-800" : ""}
          ${buttonBg}
          ${buttonBorder}
          ${buttonText}
        `}
        title="Reset to 100%"
      >
        <span className="flex items-center justify-center gap-1.5">
          <Maximize2 className="h-3.5 w-3.5 opacity-60" />
          {Math.round(zoom * 100)}%
        </span>
      </button>

      <SegmentButton
        onClick={zoomIn}
        title="Zoom in"
        isDark={isDark}
        buttonBg={buttonBg}
        buttonBorder={buttonBorder}
      >
        <ZoomIn className="h-4.5 w-4.5 opacity-60" />
      </SegmentButton>
    </div>
  );
}

function SegmentButton({
  children,
  onClick,
  title,
  disabled = false,
  isDark,
  buttonBg,
  buttonBorder,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  isDark: boolean;
  buttonBg: string;
  buttonBorder: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        flex items-center justify-center
        h-10 w-10
        rounded-xl
        bg-gradient-to-b
        border
        ${buttonBg}
        ${buttonBorder}
        ${isDark ? "text-neutral-300" : "text-neutral-700"}
        disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none
        transition-colors duration-150
        hover:${isDark ? "from-neutral-700 hover:to-neutral-800" : ""}
      `}
    >
      {children}
    </button>
  );
}