"use client"

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

  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isPanning || e.button !== 0) return
    
    const target = e.target as HTMLElement
    if (target.closest('.text-box-container') || target.tagName === 'TEXTAREA') {
      return
    }
    
    if (!canvasRef.current) return
  
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - panOffset.x
    const y = e.clientY - rect.top - panOffset.y
  
    const newBox: TextBox = {
      id: crypto.randomUUID(),
      x,
      y,
      text: "",
      width: 200,
    }
  
    setTextBoxes(prev => {
      const filtered = prev.filter(box => box.text.trim() !== "")
      return [...filtered, newBox]
    })
    
    setSelectedId(prevId => {
      if (!prevId) return newBox.id
      
      return newBox.id
    })
    
    setSelectedId(newBox.id) 
  }, [panOffset, isPanning]) 

  const handleTextChange = useCallback((id: string, text: string) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, text } : box)))
  }, [])

  const handleBoxDrag = useCallback((e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return

    // e.stopPropagation() // Prevent canvas click event
    // e.preventDefault() // Prevent text selection
    
    const box = textBoxes.find((b) => b.id === id)
    if (!box) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setSelectedId(id)
    setDraggingId(id)
    setDragOffset({
      x: e.clientX - rect.left - box.x - panOffset.x,
      y: e.clientY - rect.top - box.y - panOffset.y,
    })
  }, [textBoxes, panOffset])

  const handleSpaceDrag = useCallback((e: React.MouseEvent) => {
    // Only start panning on middle click (button 1) or right-click (button 2)
    if (e.button === 1 || e.button === 2) {
      e.preventDefault()
      e.stopPropagation()
      
      setIsPanning(true)
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      })
    }
  }, [panOffset])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Handle box dragging
      if (draggingId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left - dragOffset.x - panOffset.x
        const y = e.clientY - rect.top - dragOffset.y - panOffset.y

        setTextBoxes((prev) => prev.map((box) => 
          box.id === draggingId ? { ...box, x, y } : box
        ))
      }

      // Handle panning
      if (isPanning) {
        const newPanOffset = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }
        setPanOffset(newPanOffset)
      }
    },
    [draggingId, dragOffset, isPanning, panStart, panOffset]
  )

  const handleMouseUp = useCallback(() => {
    setDraggingId(null)
    setIsPanning(false)
  }, [])

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === "Backspace" && textBoxes.find((b) => b.id === id)?.text === "") {
      e.preventDefault()
      setTextBoxes((prev) => prev.filter((box) => box.id !== id))
      setSelectedId(null)
    }
    if (e.key === "Escape") {
      setSelectedId(null)
    }
  }, [textBoxes])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        e.preventDefault()
        setTextBoxes((prev) => prev.filter((box) => box.id !== selectedId))
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId])

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => handleMouseMove(e)
    const upHandler = () => handleMouseUp()
    
    window.addEventListener("mousemove", moveHandler)
    window.addEventListener("mouseup", upHandler)
    
    return () => {
      window.removeEventListener("mousemove", moveHandler)
      window.removeEventListener("mouseup", upHandler)
    }
  }, [handleMouseMove, handleMouseUp])

  // Auto-resize textareas
  useEffect(() => {
    textBoxes.forEach(box => {
      const textarea = document.querySelector(`[data-box-id="${box.id}"]`) as HTMLTextAreaElement
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.max(28, textarea.scrollHeight) + 'px'
      }
    })
  }, [textBoxes])

  // Reset panning on double-click canvas
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (canvasRef.current && e.target === canvasRef.current) {
      setPanOffset({ x: 0, y: 0 })
    }
  }, [])

  // Prevent default browser drag behavior
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }
    
    document.addEventListener('dragover', preventDefault)
    document.addEventListener('drop', preventDefault)
    
    return () => {
      document.removeEventListener('dragover', preventDefault)
      document.removeEventListener('drop', preventDefault)
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-neutral-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-sm font-bold text-white">
            T
          </div>
          <span className="text-sm font-medium text-neutral-700">Text Canvas</span>
        </div>
        <div className="text-xs text-neutral-500">
          Click to add text • Drag to move • Backspace to delete empty • Right-click + drag to pan
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Grid - Separate from interactive layer */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        />
        
        {/* Interactive Canvas Layer */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={handleSpaceDrag}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          className={`absolute inset-0 ${isPanning ? "cursor-grabbing" : "cursor-crosshair"}`}
        >
          {/* Text Boxes Container - moves with panning */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              willChange: 'transform',
            }}
          >
            {textBoxes.map((box) => (
              <div
                key={box.id}
                className={`absolute ${draggingId === box.id ? "cursor-grabbing" : "cursor-move"}`}
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  transform: draggingId === box.id ? 'scale(1.02)' : 'none',
                  transition: draggingId === box.id ? 'none' : 'transform 0.1s ease',
                  zIndex: selectedId === box.id ? 10 : 1,
                }}
              >
                <div
                  onMouseDown={(e) => handleBoxDrag(e, box.id)}
                  className={`group relative rounded border bg-white shadow-sm ${
                    selectedId === box.id 
                      ? "border-blue-500 shadow-md shadow-blue-500/30" 
                      : "border-neutral-300 hover:border-blue-300"
                  }`}
                >
                  {/* Selection indicator */}
                  {selectedId === box.id && (
                    <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow" />
                  )}
                  
                  <textarea
                    data-box-id={box.id}
                    autoFocus={selectedId === box.id}
                    value={box.text}
                    onChange={(e) => handleTextChange(box.id, e.target.value)}
                    onKeyDown={(e) => handleTextKeyDown(e, box.id)}
                    onFocus={() => setSelectedId(box.id)}
                    onClick={(e) => e.stopPropagation()} // Prevent canvas click
                    placeholder="Type here..."
                    className="w-[200px] resize-none bg-transparent p-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                    style={{ 
                      height: 'auto',
                      minHeight: '28px',
                    }}
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.max(28, target.scrollHeight) + 'px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {textBoxes.length === 0 && (
            <div 
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
              <div className="text-center">
                <div className="mb-4 text-5xl text-neutral-300">+</div>
                <p className="text-lg text-neutral-500">Click anywhere to add a text box</p>
                <div className="mt-4 text-sm text-neutral-400">
                  <p>• Right-click + drag to pan the canvas</p>
                  <p>• Double-click canvas to reset view</p>
                  <p>• Press Delete to remove selected box</p>
                </div>
              </div>
            </div>
          )}

          {/* Panning indicator */}
          {isPanning && (
            <div className="pointer-events-none fixed bottom-4 right-4 rounded bg-black/80 px-3 py-2 text-xs text-white">
              Panning mode - Release right click to stop
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-1 text-xs text-neutral-500">
        <div>
          {selectedId ? `Selected box at (${textBoxes.find(b => b.id === selectedId)?.x.toFixed(0)}, ${textBoxes.find(b => b.id === selectedId)?.y.toFixed(0)})` : 'No selection'}
        </div>
        <div>
          Boxes: {textBoxes.length} | Pan offset: ({panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)})
        </div>
      </div>
    </div>
  )
}