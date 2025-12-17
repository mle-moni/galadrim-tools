import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import {
  END_HOUR,
  HOURS_COUNT,
  ROOMS,
  START_HOUR,
  THEME_ME,
  THEME_OTHER,
  TIME_COLUMN_WIDTH,
} from './constants'
import type { DragSelection, Reservation } from './types'
import {
  calculateEventLayout,
  formatTime,
  getPixelsFromTime,
  getTimeFromPixels,
  roundToNearestMinutes,
} from './utils'
import EventBlock from './EventBlock'

interface SchedulerGridProps {
  currentDate: Date
  reservations: Reservation[]
  onAddReservation: (reservation: Reservation) => void
  onUpdateReservation: (reservation: Reservation) => void
  onDeleteReservation: (id: string) => void
  isFiveMinuteSlots: boolean
}

interface MovingState {
  originalReservation: Reservation
  currentReservation: Reservation
  clickTimeOffsetMinutes: number
}

export default function SchedulerGrid({
  currentDate,
  reservations,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation,
  isFiveMinuteSlots,
}: SchedulerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [pixelsPerHour, setPixelsPerHour] = useState(100)
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null)
  const [movingState, setMovingState] = useState<MovingState | null>(null)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      const height = containerRef.current.clientHeight
      setPixelsPerHour(height / HOURS_COUNT)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const intervalMinutes = isFiveMinuteSlots ? 5 : 15

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      containerRef.current.scrollLeft += e.deltaY
    }
  }

  const handleSelectionMove = (e: React.MouseEvent) => {
    if (!dragSelection) return

    const gridContent = document.getElementById(
      `room-col-${dragSelection.roomId}`,
    )
    if (!gridContent) return

    const rect = gridContent.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const safeOffsetY = Math.min(
      Math.max(0, offsetY),
      HOURS_COUNT * pixelsPerHour,
    )

    const rawTime = getTimeFromPixels(safeOffsetY, currentDate, pixelsPerHour)
    let snappedTime = roundToNearestMinutes(rawTime, intervalMinutes)

    if (snappedTime <= dragSelection.startTime) {
      snappedTime = new Date(
        dragSelection.startTime.getTime() + intervalMinutes * 60000,
      )
    }

    const maxDate = new Date(currentDate)
    maxDate.setHours(END_HOUR, 0, 0, 0)
    if (snappedTime > maxDate) snappedTime = maxDate

    setDragSelection((prev) =>
      prev ? { ...prev, endTime: snappedTime } : null,
    )
  }

  const handleEventMove = (e: React.MouseEvent) => {
    if (!movingState || !hoveredRoomId) return

    const gridContent = document.getElementById(`room-col-${hoveredRoomId}`)
    if (!gridContent) return

    const rect = gridContent.getBoundingClientRect()
    const offsetY = e.clientY - rect.top

    const mouseTime = getTimeFromPixels(offsetY, currentDate, pixelsPerHour)
    const mouseTimeMinutes = mouseTime.getHours() * 60 + mouseTime.getMinutes()

    let newStartMinutes = mouseTimeMinutes - movingState.clickTimeOffsetMinutes
    newStartMinutes =
      Math.round(newStartMinutes / intervalMinutes) * intervalMinutes

    const minMinutes = START_HOUR * 60
    const maxMinutes = END_HOUR * 60
    const durationMinutes =
      (movingState.originalReservation.endTime.getTime() -
        movingState.originalReservation.startTime.getTime()) /
      60000

    if (newStartMinutes < minMinutes) newStartMinutes = minMinutes
    if (newStartMinutes + durationMinutes > maxMinutes) {
      newStartMinutes = maxMinutes - durationMinutes
    }

    const newStart = new Date(currentDate)
    newStart.setHours(
      Math.floor(newStartMinutes / 60),
      newStartMinutes % 60,
      0,
      0,
    )

    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000)

    setMovingState((prev) =>
      prev
        ? {
            ...prev,
            currentReservation: {
              ...prev.currentReservation,
              startTime: newStart,
              endTime: newEnd,
              roomId: hoveredRoomId,
            },
          }
        : null,
    )
  }

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    if (dragSelection?.isDragging) {
      handleSelectionMove(e)
      return
    }

    if (movingState) {
      handleEventMove(e)
    }
  }

  const handleMouseDownOnGrid = (e: React.MouseEvent, roomId: string) => {
    if (e.button !== 0) return

    setSelectedEventId(null)

    const rect = e.currentTarget.getBoundingClientRect()
    const offsetY = e.clientY - rect.top

    const startTime = getTimeFromPixels(offsetY, currentDate, pixelsPerHour)
    const snappedStart = roundToNearestMinutes(startTime, intervalMinutes)
    const snappedEnd = new Date(
      snappedStart.getTime() + intervalMinutes * 60000,
    )

    setDragSelection({
      roomId,
      startTime: snappedStart,
      endTime: snappedEnd,
      isDragging: true,
    })
  }

  const handleDragStartEvent = (e: React.MouseEvent, event: Reservation) => {
    const gridContent = document.getElementById(`room-col-${event.roomId}`)
    if (!gridContent) return

    const rect = gridContent.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const clickTime = getTimeFromPixels(clickY, currentDate, pixelsPerHour)

    const clickMinutes = clickTime.getHours() * 60 + clickTime.getMinutes()
    const startMinutes =
      event.startTime.getHours() * 60 + event.startTime.getMinutes()

    setMovingState({
      originalReservation: event,
      currentReservation: { ...event },
      clickTimeOffsetMinutes: clickMinutes - startMinutes,
    })

    setHoveredRoomId(event.roomId)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragSelection?.isDragging) {
      const isOther = e.ctrlKey || e.metaKey
      const newReservation: Reservation = {
        id: Math.random().toString(36).slice(2, 11),
        roomId: dragSelection.roomId,
        title: '',
        owner: isOther ? 'Jean Michel' : 'Moi',
        startTime: dragSelection.startTime,
        endTime: dragSelection.endTime,
        color: isOther ? THEME_OTHER : THEME_ME,
      }
      onAddReservation(newReservation)
    }

    setDragSelection(null)

    if (movingState) {
      onUpdateReservation(movingState.currentReservation)
      setMovingState(null)
    }
  }

  const hourIntervals = Array.from(
    { length: HOURS_COUNT },
    (_, i) => START_HOUR + i,
  )

  const currentHour = currentTime.getHours()
  const focusStart = currentHour - 1
  const focusEnd = currentHour + 2

  const shouldShowHalfHour = (hour: number) => {
    return hour >= focusStart && hour <= focusEnd
  }

  const getRoomEvents = (roomId: string) => {
    let roomReservations = reservations.filter((r) => r.roomId === roomId)

    if (movingState) {
      roomReservations = roomReservations.filter(
        (r) => r.id !== movingState.originalReservation.id,
      )
      if (movingState.currentReservation.roomId === roomId) {
        roomReservations.push(movingState.currentReservation)
      }
    }

    return calculateEventLayout(roomReservations, pixelsPerHour)
  }

  const isToday =
    currentTime.getDate() === currentDate.getDate() &&
    currentTime.getMonth() === currentDate.getMonth() &&
    currentTime.getFullYear() === currentDate.getFullYear()

  const currentLineTop = isToday
    ? getPixelsFromTime(currentTime, pixelsPerHour)
    : -1
  const showCurrentLine =
    isToday &&
    currentLineTop >= 0 &&
    currentLineTop <= HOURS_COUNT * pixelsPerHour

  return (
    <div
      className="relative flex h-full flex-1 select-none overflow-hidden"
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative z-20 flex flex-shrink-0 flex-col border-r bg-card shadow-sm"
        style={{ width: TIME_COLUMN_WIDTH }}
      >
        <div className="flex h-10 flex-shrink-0 items-center justify-center border-b bg-muted/30">
          <span className="text-sm font-semibold text-muted-foreground">
            Heure
          </span>
        </div>

        <div className="relative flex-1">
          {hourIntervals.map((hour) => (
            <div
              key={hour}
              className="relative w-full box-border border-b border-border/50"
              style={{ height: pixelsPerHour }}
            >
              <span className="absolute top-2 left-0 right-0 text-center font-mono text-xs font-medium text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </span>

              {shouldShowHalfHour(hour) && (
                <span className="absolute top-[50%] left-0 right-0 -translate-y-1/2 text-center font-mono text-xs font-medium text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:30
                </span>
              )}
            </div>
          ))}

          {showCurrentLine && (
            <div
              className="absolute left-0 right-0 z-30 -translate-y-1/2 text-center"
              style={{ top: currentLineTop }}
            >
              <span className="rounded-sm bg-background/80 px-1 py-0.5 font-mono text-xs font-bold text-foreground shadow-sm backdrop-blur-[1px]">
                {formatTime(currentTime)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="h-full flex-1 overflow-x-auto overflow-y-hidden bg-background"
        ref={containerRef}
        onWheel={handleWheel}
      >
        <div className="flex h-full min-w-max">
          {ROOMS.map((room) => (
            <div
              key={room.id}
              className="group relative flex h-full w-52 flex-shrink-0 flex-col border-r"
              onMouseEnter={() => setHoveredRoomId(room.id)}
            >
              <div className="flex h-10 flex-shrink-0 items-center justify-center border-b bg-muted/30 text-sm font-semibold text-foreground shadow-sm">
                <span className="truncate px-2" title={room.name}>
                  {room.name}
                </span>
              </div>

              <div
                id={`room-col-${room.id}`}
                className="relative flex-1 bg-background"
                onMouseDown={(e) => handleMouseDownOnGrid(e, room.id)}
              >
                {hourIntervals.map((hour, idx) => (
                  <div
                    key={hour}
                    className="pointer-events-none absolute w-full box-border border-b border-border/40"
                    style={{ top: idx * pixelsPerHour, height: pixelsPerHour }}
                  >
                    <div className="relative top-[50%] h-full w-full border-b border-dashed border-border/30" />
                  </div>
                ))}

                {showCurrentLine && (
                  <div
                    className="pointer-events-none absolute z-30 flex w-full items-center border-t-2 border-destructive"
                    style={{ top: currentLineTop }}
                  >
                    <div className="-ml-1 h-2 w-2 rounded-full bg-destructive" />
                  </div>
                )}

                {getRoomEvents(room.id).map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    isSelected={selectedEventId === event.id}
                    onSelect={setSelectedEventId}
                    onDelete={onDeleteReservation}
                    onDragStart={(e) => handleDragStartEvent(e, event)}
                  />
                ))}

                {dragSelection && dragSelection.roomId === room.id && (
                  <div
                    className="pointer-events-none absolute z-50 flex flex-col justify-center rounded-md border-l-[6px] border-[#1e3ad7] bg-[#dbe6fe]/50 pl-2"
                    style={{
                      top: getPixelsFromTime(
                        dragSelection.startTime,
                        pixelsPerHour,
                      ),
                      height: Math.max(
                        getPixelsFromTime(
                          dragSelection.endTime,
                          pixelsPerHour,
                        ) -
                          getPixelsFromTime(
                            dragSelection.startTime,
                            pixelsPerHour,
                          ),
                        10,
                      ),
                      left: '2%',
                      width: '96%',
                    }}
                  >
                    <div className="font-mono text-[12px] font-bold text-[#171e54]">
                      {formatTime(dragSelection.startTime)} -{' '}
                      {formatTime(dragSelection.endTime)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
