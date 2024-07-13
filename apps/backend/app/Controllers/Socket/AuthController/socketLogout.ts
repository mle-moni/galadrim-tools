import { Socket } from 'socket.io'
import { partAuthRestrictedEvents } from './authRestrictedEvents.js'

export async function socketLogout(socket: Socket) {
    socket.data.user = undefined
    socket.leave('connectedSockets')
    partAuthRestrictedEvents(socket)
}
