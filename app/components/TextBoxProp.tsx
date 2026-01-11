"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { BOX_COLORS } from "../dashboard1/boxColors";
import { useTheme } from "next-themes";

interface TextBoxProps {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onTextKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onBlur?: (id: string) => void;
}

export default function TextBox({
  id,
  x,
  y,
  title,
  color,
  text,
  width,
  height,
  isSelected,
  isDragging,
  onMouseDown,
  onTextChange,
  onTextKeyDown,
  onFocus,
  onResize,
  onBlur,
}: TextBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [boxWidth, setBoxWidth] = useState(width);
  const [boxHeight, setBoxHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const MAX_WIDTH = 500;
  const MAX_HEIGHT = 400;
  const MAX_CHARS = 1000;

  const calculateFontSize = (baseSize: number) => {
    return Math.max(8, Math.min(32, baseSize));
  };

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    target.style.height = "auto";

    const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT);
    const finalHeight = Math.max(28, newHeight);

    target.style.height = finalHeight + "px";
    setBoxHeight(finalHeight);

    target.style.overflow = newHeight >= MAX_HEIGHT ? "hidden" : "hidden";
  }, []);

  // FIXED: Get color object based on color name
  const getBoxColorClasses = (colorName: string) => {
    // Check if BOX_COLORS has this color, fallback to Amber
    const colorKey = colorName as keyof typeof BOX_COLORS;
    const colorObj = BOX_COLORS[colorKey] || BOX_COLORS.Amber;
    
    // Return the appropriate theme colors
    return {
      bg: isDark ? colorObj.dark.bg : colorObj.light.bg,
      border: isDark ? colorObj.dark.border : colorObj.light.border,
      text: isDark ? colorObj.dark.text : colorObj.light.text,
      dark: "" // This can be empty or used for additional dark mode styles
    };
  };

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      const firstLine = text.split("\n")[0] || "Type here...";
      const displayText =
        firstLine.length > 30 ? firstLine.substring(0, 30) : firstLine;

      const span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.style.whiteSpace = "pre";
      span.style.fontSize = `${calculateFontSize(14)}px`;
      span.style.fontFamily = getComputedStyle(textarea).fontFamily;
      span.style.padding = "0.5rem";
      span.textContent = displayText;

      document.body.appendChild(span);
      const textWidth = span.offsetWidth;
      document.body.removeChild(span);

      const newWidth = Math.max(150, Math.min(MAX_WIDTH, textWidth + 40));
      setBoxWidth(newWidth);
    }
  }, [text]);

  const handleTextChange = useCallback(
    (id: string, newText: string) => {
      // Strictly enforce character limit
      if (newText.length > MAX_CHARS) {
        // Truncate to max characters
        newText = newText.substring(0, MAX_CHARS);
      }

      const lines = newText.split("\n");
      if (lines.length > 10) {
        newText = lines.slice(0, 10).join("\n");
      }

      onTextChange(id, newText);
    },
    [onTextChange]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if(e.button === 0) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        width: boxWidth,
        height: boxHeight,
        x: e.clientX,
        y: e.clientY,
      };
    },
    [boxWidth, boxHeight]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(
        150,
        Math.min(MAX_WIDTH, resizeStartRef.current.width + deltaX)
      );
      const newHeight = Math.max(
        50,
        Math.min(MAX_HEIGHT, resizeStartRef.current.height + deltaY)
      );

      setBoxWidth(newWidth);
      setBoxHeight(newHeight);

      if (textareaRef.current) {
        textareaRef.current.style.overflow =
          newHeight >= MAX_HEIGHT ? "hidden" : "hidden";
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (onResize) {
        onResize(id, boxWidth, boxHeight);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, id, onResize, boxWidth, boxHeight]);

  useEffect(() => {
    if (textareaRef.current) {
      const target = textareaRef.current;
      target.style.height = "auto";
      const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT);
      target.style.height = Math.max(28, newHeight) + "px";
      setBoxHeight(Math.max(28, newHeight));
    }
  }, []);

  const boxColor = getBoxColorClasses(color);
  
  return (
    <div
      data-box-id={id}
      className={`absolute transition-transform duration-200 ${
        isDragging ? "cursor-grabbing z-20" : "cursor-move"
      } ${isSelected ? "z-10" : "z-1"}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: isDragging ? "translateZ(0)" : "translateZ(0)",
        maxWidth: `${MAX_WIDTH}px`,
        filter: isDragging
          ? "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.15))"
          : "none",
        willChange: isDragging ? "transform, left, top" : "auto",
      }}
    >
      <div
        onMouseDown={(e) => onMouseDown(e, id)}
        className={`group relative rounded-xl border-2 shadow-sm p-1.5 ${
          isSelected
            ? "shadow-md"
            : "hover:shadow-xl"
        }`}
        style={{
          width: `${boxWidth}px`,
          minHeight: "60px",
          maxHeight: `${MAX_HEIGHT}px`,
          overflow: "hidden",
          backgroundColor: boxColor.bg,
          borderColor: isSelected ? boxColor.border : `${boxColor.border}80`,
          color: boxColor.text,
        }}
      >
        {/* Textarea container */}
        <div className="relative">
          {title && (
            <div
              className="w-full text-xl font-semibold mb-1 px-2 py-0.5 bg-transparent truncate"
              style={{ color: boxColor.text }}
              title={title} // Shows full title on hover
            >
              {title.split("\n")[0]}
              {title.includes("\n") && "..."}
            </div>
          )}

          {/* Main content textarea */}
          <textarea
            ref={textareaRef}
            data-box-id={id}
            maxLength={MAX_CHARS}
            autoFocus={isSelected && text.length === 0}
            value={text}
            onChange={(e) => handleTextChange(id, e.target.value)}
            onFocus={() => onFocus(id)}
            onBlur={() => onBlur?.(id)}
            onKeyDown={(e) => onTextKeyDown?.(e, id)}
            placeholder="Start typing..."
            className="w-full resize-none bg-transparent px-1.5 py-0.5 focus:outline-none overflow-hidden placeholder:text-current placeholder:opacity-40"
            style={{
              height: `${Math.max(
                24,
                Math.min(boxHeight - 40, MAX_HEIGHT - 40)
              )}px`,
              minHeight: "24px",
              maxHeight: `${MAX_HEIGHT - 40}px`,
              fontSize: `${calculateFontSize(14)}px`,
              lineHeight: "1.6",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "hidden",
              resize: "none",
              color: boxColor.text,
            }}
            onInput={handleInput}
          />
        </div>

        {/* Resize handle */}
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
          title="Resize"
          style={{
            opacity: isSelected ? 1 : 0,
          }}
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            style={{ color: boxColor.border }}
            fill="currentColor"
          >
            <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}