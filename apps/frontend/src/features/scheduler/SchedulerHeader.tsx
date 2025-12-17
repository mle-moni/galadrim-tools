import type React from 'react'
import { List } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface SchedulerHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  isFiveMinuteSlots: boolean
  setIsFiveMinuteSlots: (val: boolean) => void
  leading?: React.ReactNode
}

export default function SchedulerHeader({
  currentDate,
  onDateChange,
  isFiveMinuteSlots,
  setIsFiveMinuteSlots,
  leading,
}: SchedulerHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    onDateChange(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const floors = ['Tous', '1er étage', '2ème étage', '3ème étage']

  return (
    <header className="flex flex-col gap-4 border-b bg-background px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <h1 className="truncate text-xl font-semibold tracking-tight">
            Salles de réunions
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
            <Switch
              id="five-minute-slots"
              checked={isFiveMinuteSlots}
              onCheckedChange={setIsFiveMinuteSlots}
            />
            <Label htmlFor="five-minute-slots" className="text-sm">
              Slots de 5 minutes
            </Label>
          </div>

          <Tabs defaultValue="planning" className="hidden lg:block">
            <TabsList>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="visual">Visuel</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" className="gap-2" type="button">
            <List className="h-4 w-4" />
            Saint Paul
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-1">
          {floors.map((label, idx) => (
            <Button
              key={label}
              type="button"
              variant={idx === 0 ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'h-8',
                idx === 0 && 'shadow-none',
                idx !== 0 && 'text-muted-foreground',
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="min-w-0 flex-1 text-center text-base font-semibold capitalize text-foreground">
          {formatDate(currentDate)}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-md border bg-card p-1">
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Aujourd'hui
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrevDay}>
              Précédent
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextDay}>
              Suivant
            </Button>
          </div>

          <Tabs defaultValue="day" className="hidden lg:block">
            <TabsList>
              <TabsTrigger value="day">Jour</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  )
}
