import { useState } from 'react'

import { SidebarTrigger } from '@/components/ui/sidebar'

import SchedulerGrid from './SchedulerGrid'
import SchedulerHeader from './SchedulerHeader'
import type { Reservation } from './types'

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [isFiveMinuteSlots, setIsFiveMinuteSlots] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])

  const handleAddReservation = (newReservation: Reservation) => {
    setReservations((prev) => [...prev, newReservation])
  }

  const handleUpdateReservation = (updatedReservation: Reservation) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === updatedReservation.id
          ? updatedReservation
          : reservation,
      ),
    )
  }

  const handleDeleteReservation = (id: string) => {
    setReservations((prev) =>
      prev.filter((reservation) => reservation.id !== id),
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SchedulerHeader
        leading={
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
          </div>
        }
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isFiveMinuteSlots={isFiveMinuteSlots}
        setIsFiveMinuteSlots={setIsFiveMinuteSlots}
      />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SchedulerGrid
          currentDate={currentDate}
          reservations={reservations}
          onAddReservation={handleAddReservation}
          onUpdateReservation={handleUpdateReservation}
          onDeleteReservation={handleDeleteReservation}
          isFiveMinuteSlots={isFiveMinuteSlots}
        />
      </main>
    </div>
  )
}
