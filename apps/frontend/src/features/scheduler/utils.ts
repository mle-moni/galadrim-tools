import type { LayoutEvent, Reservation } from './types'
import { START_HOUR } from './constants'

export function getPixelsFromTime(date: Date, pixelsPerHour: number) {
  const hours = date.getHours()
  const minutes = date.getMinutes()

  const totalMinutes = (hours - START_HOUR) * 60 + minutes
  return (totalMinutes / 60) * pixelsPerHour
}

export function getTimeFromPixels(
  pixels: number,
  baseDate: Date,
  pixelsPerHour: number,
) {
  const totalHours = pixels / pixelsPerHour
  const hoursToAdd = Math.floor(totalHours)
  const minutesToAdd = Math.floor((totalHours - hoursToAdd) * 60)

  const newDate = new Date(baseDate)
  newDate.setHours(START_HOUR + hoursToAdd, minutesToAdd, 0, 0)
  return newDate
}

export function roundToNearestMinutes(date: Date, interval: number = 15) {
  const ms = 1000 * 60 * interval
  return new Date(Math.round(date.getTime() / ms) * ms)
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function doOverlap(a: Reservation, b: Reservation) {
  return a.startTime < b.endTime && b.startTime < a.endTime
}

export function calculateEventLayout(
  events: Reservation[],
  pixelsPerHour: number,
): LayoutEvent[] {
  const sortedEvents = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  )

  const eventsWithMetrics: LayoutEvent[] = sortedEvents.map((event) => {
    const top = getPixelsFromTime(event.startTime, pixelsPerHour)
    const bottom = getPixelsFromTime(event.endTime, pixelsPerHour)

    return {
      ...event,
      top,
      height: bottom - top,
      left: 0,
      width: 100,
    }
  })

  for (let i = 0; i < eventsWithMetrics.length; i++) {
    const current = eventsWithMetrics[i]
    const overlappingGroup = [current]

    for (let j = 0; j < eventsWithMetrics.length; j++) {
      if (i === j) continue
      const other = eventsWithMetrics[j]
      if (doOverlap(current, other)) {
        overlappingGroup.push(other)
      }
    }

    const count = overlappingGroup.length
    if (count > 1) {
      overlappingGroup.sort((a, b) => a.id.localeCompare(b.id))
      const index = overlappingGroup.findIndex(
        (event) => event.id === current.id,
      )

      current.width = 100 / count
      current.left = index * current.width
    }
  }

  return eventsWithMetrics
}
