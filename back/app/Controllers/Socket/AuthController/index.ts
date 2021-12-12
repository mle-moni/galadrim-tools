import { Socket } from 'socket.io'
import { socketAuth, SocketAuthDto } from './socketAuth'
import { socketLogout } from './socketLogout'

export function initSocketAuthControllerEvents(socket: Socket) {
    socket.on('auth', (dto: SocketAuthDto) => socketAuth(socket, dto))
    socket.on('logout', () => socketLogout(socket))
}
