import { RawRoomEvent, RoomEvent } from '../stores/EventsStore'
import { fetchBackend } from './fetch'

export const fetchEvents = async () => {
    const res = await fetchBackend('/events')
    if (!res.ok) return []
    return res.json()
}

const sendEvent = async (
    { start, end, room }: Omit<RoomEvent, 'id' | 'title'>,
    method: 'POST' | 'PUT',
    id?: number
): Promise<RoomEvent> => {
    const form = new FormData()
    form.append('start', start.toISOString())
    form.append('end', end.toISOString())
    form.append('room', room)
    const eventId = id ? `/${id}` : ''
    const res = await fetchBackend(`/events${eventId}`, method, { body: form })
    if (!res.ok) throw new Error('api call failed')
    const rawEvent = await res.json()
    return getEventFromApi(rawEvent)
}

export const postEvent = async (params: Omit<RoomEvent, 'id' | 'title'>): Promise<RoomEvent> => {
    return sendEvent(params, 'POST')
}

export const putEvent = async (params: Omit<RoomEvent, 'title'>): Promise<RoomEvent> => {
    return sendEvent(params, 'PUT', params.id)
}

export const getEventFromApi = (rawEvent: RawRoomEvent): RoomEvent => {
    return {
        id: rawEvent.id,
        start: new Date(rawEvent.start),
        end: new Date(rawEvent.end),
        title: rawEvent.title,
        room: rawEvent.room,
    }
}
