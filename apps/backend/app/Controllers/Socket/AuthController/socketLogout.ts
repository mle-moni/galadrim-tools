import { Socket } from 'socket.io'
import { partAuthRestrictedEvents } from './authRestrictedEvents'

export async function socketLogout(socket: Socket) {
    socket.data.user = undefined
    socket.leave('connectedSockets')
    partAuthRestrictedEvents(socket)
}
