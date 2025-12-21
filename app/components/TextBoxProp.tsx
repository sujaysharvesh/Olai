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
    
    target.style.overflow = newHeight >= MAX_HEIGHT ? "auto" : "hidden"
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
    if (newText.length > MAX_CHARS) {
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
        textareaRef.current.style.overflow = newHeight >= MAX_HEIGHT ? 'auto' : 'hidden'
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
      className={`absolute text-box-container ${
        isDragging ? "cursor-grabbing" : "cursor-move"
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: isDragging ? "scale(1.02)" : "none",
        transition: isDragging ? "none" : "transform 0.1s ease",
        zIndex: isSelected ? 10 : 1,
        maxWidth: `${MAX_WIDTH}px`,
      }}
    >
      <div
        onMouseDown={(e) => onMouseDown(e, id)}
        className={`group relative rounded-lg border bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-md p-1 ${
          isSelected
            ? "ring-2 ring-amber-500 shadow-2xl"
            : "ring-1 ring-neutral-200 hover:ring-amber-300 hover:shadow-xl dark:ring-neutral-700"
        }`}
        style={{
          width: `${boxWidth}px`,
          maxHeight: `${MAX_HEIGHT}px`,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        <textarea
          ref={textareaRef}
          data-box-id={id}
          autoFocus={isSelected}
          value={text}
          onChange={(e) => handleTextChange(id, e.target.value)}
          onKeyDown={(e) => onTextKeyDown(e, id)}
          onFocus={() => onFocus(id)}
          placeholder="Type here..."
          className="resize-none bg-transparent p-1 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          style={{
            width: "100%",
            height: `${boxHeight}px`,
            minHeight: "28px",
            maxHeight: `${MAX_HEIGHT}px`,
            fontSize: `${calculateFontSize(14)}px`,
            lineHeight: "1.5",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            overflow: "hidden",
            resize: "none",
          }}
          onInput={handleInput}
        />
        
        {text.length > MAX_CHARS * 0.8 && (
          <div className="absolute bottom-1 right-1 text-xs text-neutral-500 bg-white/90 dark:bg-neutral-800/90 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-600">
            {text.length}/{MAX_CHARS}
          </div>
        )}

        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-neutral-400" fill="currentColor">
            <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM10 10H8V8H10V10ZM6 14H4V12H6V14Z" />
          </svg>
        </div>
      </div>
    </div>
  )
}