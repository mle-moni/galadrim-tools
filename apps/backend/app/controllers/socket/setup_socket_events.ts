import { Socket } from 'socket.io'
import { partAuthRestrictedEvents } from './auth_restricted_events.js'
import { socketAuth } from './socket_auth.js'
import { CONNECTED_SOCKETS } from './socket_constants.js'

function socketLogout(socket: Socket) {
  socket.data.user = undefined
  socket.leave(CONNECTED_SOCKETS)
  partAuthRestrictedEvents(socket)
}

export function setupSocketEvents(socket: Socket) {
  socket.on('auth', (dto: unknown) => socketAuth(socket, dto))
  socket.on('logout', () => socketLogout(socket))
}
