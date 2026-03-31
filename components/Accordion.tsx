'use client'

import { useState } from 'react'

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export default function Accordion({
  title,
  children,
  defaultExpanded = false,
}: AccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-amber-50 px-4 py-3 text-left font-medium text-amber-900 transition-all hover:bg-amber-100 dark:bg-slate-700 dark:text-amber-100 dark:hover:bg-slate-600"
      >
        <span>{title}</span>
        <span
          className={`transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`transition-all duration-300 ${
          isExpanded
            ? 'max-h-[1000px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
