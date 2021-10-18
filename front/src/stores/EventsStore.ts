import { makeAutoObservable } from 'mobx'
import { stringOrDate } from 'react-big-calendar'
import { deleteEvent, fetchEvents, getEventFromApi, postEvent, putEvent } from '../api/events'
import { AppStore } from './AppStore'

export type DateRange = Date[] | {
    start: stringOrDate;
    end: stringOrDate;
}

export type RoomEvent = { id: number, start: Date, end: Date, title: string, room: string, allDay?: boolean }

export class EventsStore {
    public initialEvent = this.makeInitialEvent(new Date())

    public events: RoomEvent[] = [this.initialEvent]

    public roomName = ''

    constructor() {
        makeAutoObservable(this)
    }

    async init() {
        const events: RoomEvent[] = (await fetchEvents()).map(
            (rawEvent: any) => getEventFromApi(rawEvent)
        )
        this.appendEvents(events)
    }

    setRoomName(name: string) {
        this.roomName = name
        this.onNavigate(new Date())
    }

    makeInitialEvent(date: Date): RoomEvent {
        return {
            id: 0,
            title: 'nouvel évenement',
            start: new Date(new Date(new Date(date).setHours(0)).setMinutes(0)),
            end: new Date(new Date(new Date(date).setHours(0)).setMinutes(30)),
            room: '*',
            allDay: true
        }
    }

    onNavigate(date: Date) {
        const initialDate = this.makeInitialEvent(date)
        const events = this.events.filter((event) => event.id !== 0)
        events.unshift(initialDate)
        this.events = events
    }

    onRangeChange(range: DateRange) {
        if (range instanceof Array) {
            this.onNavigate(range[0])
        }
    }

    onEventDrop({
        event,
        start,
        end,
    }: {
        event: any
        start: stringOrDate
        end: stringOrDate
        isAllDay: boolean
    }) {
        const [startDate, endDate] = [new Date(start), new Date(end)]
        if (event?.id === 0) {
            this.newEvent(startDate, endDate)
            return
        }
        this.moveEvent(event?.id, startDate, endDate)
    }
    async newEvent(start: Date, end: Date) {
        if (this.roomName === '*') {
            alert('impossible de créer un event depuis ici pour le moment')
            return
        }
        const event: RoomEvent = await postEvent({ start, end, title: AppStore.username, room: this.roomName })
        this.appendEvents([event])
    }
    onDoubleClickEvent(event: any) {
        if (event.id === 0) return
        return this.removeEvent(event.id)
    }
    async removeEvent(id: number) {
        const res = await deleteEvent(id)
        if (!res.deleted) return
        const events = this.events.filter((event) => event.id !== id)
        this.setEvents(events)
    }
    appendEvents(events: RoomEvent[]) {
        this.events = [...this.events, ...events]
    }
    setEvents(events: RoomEvent[]) {
        this.events = events
    }
    async moveEvent(eventId: number, start: Date, end: Date) {
        const events = [...this.events]
        const event = events.find((event) => event.id === eventId)
        if (!event) return
        const updatedEvent = await putEvent({ id: event.id, start, end, room: event.room, title: event.title })
        this.setEventDates(event, updatedEvent.start, updatedEvent.end)
        this.setEvents(events)
    }

    setEventDates(event: RoomEvent, start: Date, end: Date) {
        event.start = start
        event.end = end
    }

    getRoomEvents(roomName: string) {
        if (roomName === '*') return this.events.map((event) => {
            return { ...event, title: `${event.title} (${event.room})` }
        })
        return this.events.filter((event) => event.room === roomName || event.room === '*')
    }

    get roomEvents() {
        return this.getRoomEvents(this.roomName)
    }

    eventCollide(event: RoomEvent, date: Date): boolean {
        if (date < event.start || date > event.end) return false
        return true
    }

    roomIsAvailable(roomName: string, date: Date) {
        const events = this.getRoomEvents(roomName)
        return events.every((event) => !this.eventCollide(event, date))
    }
}
