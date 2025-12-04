"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"

interface TextBox {
  id: string
  x: number
  y: number
  text: string
  width: number
}

export default function FigmaCanvas() {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newBox: TextBox = {
      id: crypto.randomUUID(),
      x,
      y,
      text: "",
      width: 200,
    }

    setTextBoxes((prev) => [...prev, newBox])
    setSelectedId(newBox.id)
  }

  const handleTextChange = (id: string, text: string) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, text } : box)))
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const box = textBoxes.find((b) => b.id === id)
    if (!box) return

    setSelectedId(id)
    setDraggingId(id)
    setDragOffset({
      x: e.clientX - box.x,
      y: e.clientY - box.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x + rect.left
      const y = e.clientY - rect.top - dragOffset.y + rect.top

      setTextBoxes((prev) =>
        prev.map((box) => (box.id === draggingId ? { ...box, x: Math.max(0, x), y: Math.max(0, y) } : box)),
      )
    },
    [draggingId, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setDraggingId(null)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Backspace" && textBoxes.find((b) => b.id === id)?.text === "") {
      e.preventDefault()
      setTextBoxes((prev) => prev.filter((box) => box.id !== id))
      setSelectedId(null)
    }
    if (e.key === "Escape") {
      setSelectedId(null)
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      {/* <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-sm font-bold text-white">
            T
          </div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Text Space</span>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Click anywhere to add text • Drag to move • Backspace on empty to delete
        </div>
      </div> */}

      {/* Canvas */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="relative flex-1 cursor-crosshair overflow-auto"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {textBoxes.map((box) => (
          <div
            key={box.id}
            className={`absolute ${draggingId === box.id ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ left: box.x, top: box.y }}
          >
            <div
              onMouseDown={(e) => handleMouseDown(e, box.id)}
              className={`group relative rounded-sm ${
                selectedId === box.id ? "ring-2 ring-blue-500" : "ring-1 ring-transparent hover:ring-blue-300"
              }`}
            >
              {/* Drag handle indicator */}
              {selectedId === box.id && <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-blue-500" />}
              <textarea
                autoFocus={selectedId === box.id}
                value={box.text}
                onChange={(e) => handleTextChange(box.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, box.id)}
                onFocus={() => setSelectedId(box.id)}
                placeholder="Type here..."
                className="min-h-[28px] w-[200px] resize-none bg-transparent p-1 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none dark:text-black dark:placeholder:text-neutral-500"
                style={{ height: "auto" }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = target.scrollHeight + "px"
                }}
              />
            </div>
          </div>
        ))}

        {/* Empty state */}
        {textBoxes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl text-neutral-300 dark:text-neutral-600">+</div>
              <p className="text-sm text-neutral-400 dark:text-neutral-500">Click anywhere to start typing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
