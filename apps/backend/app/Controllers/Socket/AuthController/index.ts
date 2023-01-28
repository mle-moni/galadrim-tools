import { Socket } from 'socket.io'
import { socketAuth } from './socketAuth'
import { socketLogout } from './socketLogout'

export function initSocketAuthControllerEvents(socket: Socket) {
    socket.on('auth', (dto: unknown) => socketAuth(socket, dto))
    socket.on('logout', () => socketLogout(socket))
}
