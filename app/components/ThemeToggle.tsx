'use client'

import { Moon } from "lucide-react"
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className="flex w-full items-center gap-2">
      {/* Icon */}
      <Moon className="h-4 w-4 dark:text-neutral-400" />

      {/* Label */}
      <span className="flex-1 text-sm dark:text-neutral-300">
        Dark mode
      </span>

      {/* Switch */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        role="switch"
        aria-checked={isDark}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full
          transition-colors
          ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 rounded-full bg-white
            transition-transform
            ${isDark ? 'translate-x-4' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}
