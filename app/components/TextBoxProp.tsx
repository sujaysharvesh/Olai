'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

interface TextBoxProps {
  id: string
  x: number
  y: number
  text: string
  width: number
  height: number
  isSelected: boolean
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent, id: string) => void
  onTextChange: (id: string, text: string) => void
  onTextKeyDown: (e: React.KeyboardEvent, id: string) => void
  onFocus: (id: string) => void
  onResize?: (id: string, width: number, height: number) => void
  onBlur?: (id: string) => void
}

export default function TextBox({
  id,
  x,
  y,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [boxWidth, setBoxWidth] = useState(width)
  const [boxHeight, setBoxHeight] = useState(height)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 })

  const MAX_WIDTH = 500
  const MAX_HEIGHT = 400
  const MAX_CHARS = 1000

  const calculateFontSize = (baseSize: number) => {
    return Math.max(8, Math.min(32, baseSize))
  }

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    
    target.style.height = "auto"
    
    const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT)
    const finalHeight = Math.max(28, newHeight)
    
    target.style.height = finalHeight + "px"
    setBoxHeight(finalHeight)
    
    target.style.overflow = newHeight >= MAX_HEIGHT ? "hidden" : "hidden"
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      
      const firstLine = text.split('\n')[0] || 'Type here...'
      const displayText = firstLine.length > 30 ? firstLine.substring(0, 30) : firstLine
      
      const span = document.createElement('span')
      span.style.visibility = 'hidden'
      span.style.position = 'absolute'
      span.style.whiteSpace = 'pre'
      span.style.fontSize = `${calculateFontSize(14)}px`
      span.style.fontFamily = getComputedStyle(textarea).fontFamily
      span.style.padding = '0.5rem'
      span.textContent = displayText
      
      document.body.appendChild(span)
      const textWidth = span.offsetWidth
      document.body.removeChild(span)
      
      const newWidth = Math.max(150, Math.min(MAX_WIDTH, textWidth + 40))
      setBoxWidth(newWidth)
    }
  }, [text])

  const handleTextChange = useCallback((id: string, newText: string) => {
    // Strictly enforce character limit
    if (newText.length > MAX_CHARS) {
      // Truncate to max characters
      newText = newText.substring(0, MAX_CHARS)
    }
    
    const lines = newText.split('\n')
    if (lines.length > 10) {
      newText = lines.slice(0, 10).join('\n')
    }
    
    onTextChange(id, newText)
  }, [onTextChange])

 
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    resizeStartRef.current = {
      width: boxWidth,
      height: boxHeight,
      x: e.clientX,
      y: e.clientY
    }
  }, [boxWidth, boxHeight])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      
      const newWidth = Math.max(150, Math.min(MAX_WIDTH, resizeStartRef.current.width + deltaX))
      const newHeight = Math.max(50, Math.min(MAX_HEIGHT, resizeStartRef.current.height + deltaY))
      
      setBoxWidth(newWidth)
      setBoxHeight(newHeight)
      
      if (textareaRef.current) {
        textareaRef.current.style.overflow = newHeight >= MAX_HEIGHT ? 'hidden' : 'hidden'
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResize) {
        onResize(id, boxWidth, boxHeight)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, id, onResize, boxWidth, boxHeight])

  useEffect(() => {
    if (textareaRef.current) {
      const target = textareaRef.current
      target.style.height = "auto"
      const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT)
      target.style.height = Math.max(28, newHeight) + "px"
      setBoxHeight(Math.max(28, newHeight))
    }
  }, [])

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
        filter: isDragging ? "drop-shadow(0 10px 15px rgba(0, 0, 0, 0.15))" : "none",
        willChange: isDragging ? "transform, left, top" : "auto",
      }}
    >
      <div
        onMouseDown={(e) => onMouseDown(e, id)}
        className={`group relative rounded-xl border-2 bg-gradient-to-br from-white via-white to-neutral-50 
          dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-900 
          shadow-lg p-1.5
          ${
            isSelected
              ? "border-amber-500/80 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30"
              : "border-neutral-200/80 hover:border-amber-400/60 hover:shadow-xl dark:border-neutral-700/80"
          }`}
        style={{
          width: `${boxWidth}px`,
          minHeight: '60px',
          maxHeight: `${MAX_HEIGHT}px`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center space-x-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 opacity-60" />
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Text Box
            </span>
          </div>
        </div>
  
        {/* Textarea container */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            data-box-id={id}
            maxLength={MAX_CHARS}
            autoFocus={isSelected && text.length === 0}
            value={text}
            onChange={(e) => {
              const newText = e.target.value
              handleTextChange(id, newText)
            }}
            // onPaste={handlePaste}
            onFocus={() => onFocus(id)}
            onBlur={() => onBlur?.(id)}
            placeholder="Start typing..."
            className="w-full resize-none bg-transparent px-1.5 py-0.5 text-neutral-800 
              dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 
              focus:outline-none overflow-hidden"
            style={{
              height: `${Math.max(24, Math.min(boxHeight - 40, MAX_HEIGHT - 40))}px`,
              minHeight: "24px",
              maxHeight: `${MAX_HEIGHT - 40}px`,
              fontSize: `${calculateFontSize(14)}px`,
              lineHeight: "1.6",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              overflowY: "hidden",
              resize: "none",
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
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-neutral-400" fill="currentColor">
                      <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
                    </svg>
        </div>
  
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-amber-500/30 rounded-xl pointer-events-none" />
        )}
      </div>
    </div>
  )
}