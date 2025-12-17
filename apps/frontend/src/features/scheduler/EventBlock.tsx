import type React from 'react'

import type { LayoutEvent } from './types'
import { formatTime } from './utils'

import { cn } from '@/lib/utils'

interface EventBlockProps {
  event: LayoutEvent
  isSelected: boolean
  onSelect: (id: string | null) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.MouseEvent, event: LayoutEvent) => void
}

export default function EventBlock({
  event,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
}: EventBlockProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    onDragStart(e, event)
    onSelect(event.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(event.id)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'absolute flex cursor-pointer select-none flex-col justify-start overflow-hidden rounded-md border-l-[6px] p-2 shadow-sm transition-none',
        event.color,
        isSelected
          ? 'z-50 ring-2 ring-[#1e3ad7] ring-offset-2 ring-offset-background'
          : 'z-10 hover:z-40 hover:brightness-95',
      )}
      style={{
        top: `${event.top}px`,
        height: `${Math.max(event.height, 20)}px`,
        left: `${event.left}%`,
        width: `${event.width}%`,
      }}
    >
      <div className="truncate text-sm font-semibold leading-tight">
        {event.owner}
      </div>
      <div className="font-mono text-xs leading-tight tracking-wide opacity-90">
        {formatTime(event.startTime)} - {formatTime(event.endTime)}
      </div>
    </div>
  )
}
