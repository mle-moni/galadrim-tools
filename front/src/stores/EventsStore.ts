import { makeAutoObservable } from 'mobx'
import { stringOrDate } from 'react-big-calendar'
import { fetchEvents, getEventFromApi, postEvent, putEvent } from '../api/events'
import { ApiError, fetchBackendJson } from '../api/fetch'
import { notifyError } from '../utils/notification'
import { AppStore } from './AppStore'

export type DateRange =
    | Date[]
    | {
          start: stringOrDate
          end: stringOrDate
      }

export type RoomEvent = {
    id: number
    start: Date
    end: Date
    title: string
    room: string
    allDay?: boolean
}

export class EventsStore {
    public initialEvent = this.makeInitialEvent(new Date())

    public events: RoomEvent[] = [this.initialEvent]

    public roomName = ''

    constructor() {
        makeAutoObservable(this)
    }

    async init() {
        const events: RoomEvent[] = (await fetchEvents()).map((rawEvent: any) =>
            getEventFromApi(rawEvent)
        )
        this.appendEvents(events)
    }

    resetEvents() {
        this.events = [this.initialEvent]
        this.init()
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
            allDay: true,
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
        resourceId: roomName,
    }: {
        event: any
        start: stringOrDate
        end: stringOrDate
        isAllDay: boolean
        resourceId?: string
    }) {
        const [startDate, endDate] = [new Date(start), new Date(end)]
        if (event?.id === 0) {
            this.newEvent(startDate, endDate)
            return
        }
        this.moveEvent(event?.id, startDate, endDate, roomName)
    }
    async newEvent(start: Date, end: Date, roomName = null) {
        const event: RoomEvent = await postEvent({
            start,
            end,
            title: AppStore.authStore.user.username,
            room: roomName ?? this.roomName,
        })
        this.appendEvents([event])
    }
    onDoubleClickEvent(event: any) {
        if (event.id === 0) return
        return this.removeEvent(event.id)
    }
    async removeEvent(id: number) {
        const res = await fetchBackendJson<{ id: number; deleted: boolean }, ApiError>(
            `/events/${id}`,
            'DELETE'
        )
        if (!res.ok || !res.json.deleted) return
        const events = this.events.filter((event) => event.id !== id)
        this.setEvents(events)
    }
    appendEvents(events: RoomEvent[]) {
        this.events = [...this.events, ...events]
    }
    setEvents(events: RoomEvent[]) {
        this.events = events
    }
    async moveEvent(eventId: number, start: Date, end: Date, roomName?: string) {
        const events = [...this.events]
        const event = events.find((event) => event.id === eventId)
        if (!event) return
        const updatedEvent = await putEvent({
            id: event.id,
            start,
            end,
            room: roomName ?? event.room,
            title: event.title,
        })
        this.setEventDates(event, updatedEvent.start, updatedEvent.end)
        this.setEventRoom(event, updatedEvent.room)
        this.setEvents(events)
    }

    setEventDates(event: RoomEvent, start: Date, end: Date) {
        event.start = start
        event.end = end
    }

    setEventRoom(event: RoomEvent, room: string) {
        event.room = room
    }

    getRoomEvents(roomName: string) {
        if (roomName === '*')
            return this.events.map((event) => {
                return { ...event, title: `${event.title} (${event.room})` }
            })
        return this.events.filter((event) => event.room === roomName || event.room === '*')
    }

    get roomEvents() {
        return this.getRoomEvents(this.roomName)
    }

    eventCollide(event: RoomEvent, date: Date): boolean {
        return !(date < event.start || date > event.end)
    }

    roomIsAvailable(roomName: string, date: Date) {
        const events = this.getRoomEvents(roomName)
        return events.every((event) => !this.eventCollide(event, date))
    }
}
