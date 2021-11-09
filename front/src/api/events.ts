import { RoomEvent } from '../stores/EventsStore'
import { fetchBackend } from './fetch'

export const fetchEvents = async () => {
    const res = await fetchBackend('/events')
    if (!res.ok) return []
    return res.json()
}

const sendEvent = async (
    { start, end, title, room }: Omit<RoomEvent, 'id'>,
    method: 'POST' | 'PUT',
    id?: number
): Promise<RoomEvent> => {
    const form = new FormData()
    form.append('start', start.toISOString())
    form.append('end', end.toISOString())
    form.append('title', title)
    form.append('room', room)
    const eventId = id ? `/${id}` : ''
    const res = await fetchBackend(`/events${eventId}`, method, { body: form })
    if (!res.ok) throw new Error('api call failed')
    const rawEvent = await res.json()
    return getEventFromApi(rawEvent)
}

export const postEvent = async (params: Omit<RoomEvent, 'id'>): Promise<RoomEvent> => {
    return sendEvent(params, 'POST')
}

export const putEvent = async (params: RoomEvent): Promise<RoomEvent> => {
    return sendEvent(params, 'PUT', params.id)
}

export const getEventFromApi = (rawEvent: any): RoomEvent => {
    return {
        id: rawEvent.id,
        start: new Date(rawEvent.start),
        end: new Date(rawEvent.end),
        title: rawEvent.title,
        room: rawEvent.room,
    }
}
