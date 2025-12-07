'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded text-xl invisible">
        🌙
      </button>
    )
  }

  return (
    <button 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}