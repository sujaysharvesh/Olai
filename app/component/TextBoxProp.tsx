'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

interface TextBoxProps {
  id: string
  x: number
  y: number
  text: string
  isSelected: boolean
  isDragging: boolean
  onMouseDown: (e: React.MouseEvent, id: string) => void
  onTextChange: (id: string, text: string) => void
  onTextKeyDown: (e: React.KeyboardEvent, id: string) => void
  onFocus: (id: string) => void
}

export default function TextBox({
  id,
  x,
  y,
  text,
  isSelected,
  isDragging,
  onMouseDown,
  onTextChange,
  onTextKeyDown,
  onFocus,
}: TextBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [boxWidth, setBoxWidth] = useState(200)
  const [boxHeight, setBoxHeight] = useState(28)

  // Fixed maximum dimensions - no scrollbars
  const MAX_WIDTH = 500
  const MAX_HEIGHT = 200
  const MAX_CHARS = 1000

  const calculateFontSize = (baseSize: number) => {
    return Math.max(8, Math.min(32, baseSize))
  }

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    
    // Reset height to auto to calculate new height
    target.style.height = "auto"
    
    // Calculate new height with MAX_HEIGHT constraint
    const newHeight = Math.min(target.scrollHeight, MAX_HEIGHT)
    const finalHeight = Math.max(28, newHeight)
    
    // Set the calculated height
    target.style.height = finalHeight + "px"
    setBoxHeight(finalHeight)
    
    // Never show scrollbars - just clip content
    target.style.overflow = "hidden"
  }, [])

  // Adjust width based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      
      // Get only the first line for width calculation
      const firstLine = text.split('\n')[0] || 'Type here...'
      const displayText = firstLine.length > 30 ? firstLine.substring(0, 30) : firstLine
      
      // Create a temporary span to measure text width
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
      
      // Set width with strict constraints
      const newWidth = Math.max(150, Math.min(MAX_WIDTH, textWidth + 40))
      setBoxWidth(newWidth)
    }
  }, [text])

  // Limit text when pasting/typing
  const handleTextChange = useCallback((id: string, newText: string) => {
    // Limit character count
    if (newText.length > MAX_CHARS) {
      newText = newText.substring(0, MAX_CHARS)
    }
    
    // Limit number of lines to prevent excessive height
    const lines = newText.split('\n')
    if (lines.length > 10) { // Max 10 lines
      newText = lines.slice(0, 10).join('\n')
    }
    
    onTextChange(id, newText)
  }, [onTextChange])

  // Auto-resize on initial render
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
        maxWidth: `${MAX_WIDTH}px`, // Prevent overflow
      }}
    >
      <div
        onMouseDown={(e) => onMouseDown(e, id)}
        className={`group relative rounded border bg-white dark:bg-[#57595B] shadow-sm ${
          isSelected
            ? "border-gray-200 shadow-md"
            : "border-neutral-300 dark:border-gray-600 hover:border-blue-300"
        }`}
        style={{
          width: `${boxWidth}px`,
          maxHeight: `${MAX_HEIGHT}px`,
          transition: 'width 0.2s ease',
          overflow: 'hidden', // Hide overflow content
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
          className="resize-none bg-transparent p-2 text-sm text-neutral-800 dark:text-gray-900 placeholder:text-neutral-400 dark:placeholder:text-gray-500 focus:outline-none"
          style={{
            width: "100%",
            height: `${boxHeight}px`,
            minHeight: "28px",
            maxHeight: `${MAX_HEIGHT}px`,
            fontSize: `${calculateFontSize(14)}px`,
            lineHeight: "1.5",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            overflow: "hidden", // Hide scrollbars
            resize: "none", // Prevent manual resizing
          }}
          onInput={handleInput}
        />
        
        {/* Show character count when approaching limit */}
        {text.length > MAX_CHARS * 0.8 && (
          <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/90 px-1.5 py-0.5 rounded border border-gray-200">
            {text.length}/{MAX_CHARS}
          </div>
        )}
      </div>
    </div>
  )
}