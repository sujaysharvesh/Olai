'use client'

import { useEffect, useRef, useState } from 'react'

interface TextPopoverProps {
  isOpen: boolean
  text: string
  onClose: () => void
  onSave: (text: string) => void
  zoom: number
  boxPosition: { x: number; y: number }
}

export default function TextPopover({
  isOpen,
  text,
  onClose,
  onSave,
  zoom,
  boxPosition,
}: TextPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [popoverText, setPopoverText] = useState(text)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 600, height: 400 })

  const MAX_CHARS = 5000

  // Calculate position based on screen center and zoom
  useEffect(() => {
    if (!isOpen || !popoverRef.current) return

    const calculatePosition = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Calculate popover dimensions (responsive)
      const popoverWidth = Math.min(600, viewportWidth * 0.8)
      const popoverHeight = Math.min(500, viewportHeight * 0.7)
      
      // Try to position near the text box first (if visible)
      const boxCenterX = boxPosition.x + (200 / 2) // Assuming box width ~200px
      const boxCenterY = boxPosition.y + (100 / 2) // Assuming box height ~100px
      
      // Check if box is visible in viewport (considering zoom)
      const zoomOffsetX = (viewportWidth * (zoom - 1)) / 2
      const zoomOffsetY = (viewportHeight * (zoom - 1)) / 2
      
      const adjustedBoxX = boxCenterX * zoom - zoomOffsetX
      const adjustedBoxY = boxCenterY * zoom - zoomOffsetY
      
      let popoverX, popoverY
      
      // If box is visible, position popover near it
      if (
        adjustedBoxX >= 0 && adjustedBoxX <= viewportWidth &&
        adjustedBoxY >= 0 && adjustedBoxY <= viewportHeight
      ) {
        // Position to the right of the box if there's space
        if (adjustedBoxX + 200 + popoverWidth <= viewportWidth) {
          popoverX = adjustedBoxX + 220
        } 
        // Position to the left if there's space
        else if (adjustedBoxX - popoverWidth - 20 >= 0) {
          popoverX = adjustedBoxX - popoverWidth - 20
        }
        // Otherwise center horizontally
        else {
          popoverX = (viewportWidth - popoverWidth) / 2
        }
        
        // Position vertically centered relative to box
        popoverY = Math.max(20, Math.min(
          adjustedBoxY - (popoverHeight / 2),
          viewportHeight - popoverHeight - 20
        ))
      } 
      // If box is not visible, center the popover
      else {
        popoverX = (viewportWidth - popoverWidth) / 2
        popoverY = (viewportHeight - popoverHeight) / 2
      }
      
      // Ensure popover stays within bounds
      popoverX = Math.max(20, Math.min(popoverX, viewportWidth - popoverWidth - 20))
      popoverY = Math.max(20, Math.min(popoverY, viewportHeight - popoverHeight - 20))
      
      setPosition({ x: popoverX, y: popoverY })
      setSize({ width: popoverWidth, height: popoverHeight })
    }

    calculatePosition()
    
    // Update on window resize
    window.addEventListener('resize', calculatePosition)
    return () => window.removeEventListener('resize', calculatePosition)
  }, [isOpen, zoom, boxPosition])

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(
          popoverText.length,
          popoverText.length
        )
      }, 10)
    }
  }, [isOpen, popoverText])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= MAX_CHARS) {
      setPopoverText(newText)
    }
  }

  // Handle save
  const handleSave = () => {
    onSave(popoverText)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      
      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 rounded-xl border border-gray-200 bg-white shadow-2xl dark:bg-gray-800 dark:border-gray-700 transition-all duration-150"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: 'translateZ(0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Text
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <div className="p-4 h-[calc(100%-112px)]">
          <textarea
            ref={textareaRef}
            value={popoverText}
            onChange={handleTextChange}
            className="w-full h-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-base leading-relaxed"
            style={{
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#9ca3af #f3f4f6',
            }}
            placeholder="Type your content here..."
          />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {popoverText.length} / {MAX_CHARS} characters
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}