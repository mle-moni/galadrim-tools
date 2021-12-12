import { Socket } from 'socket.io'
import { socketAuth, SocketAuthDto } from './socketAuth'

export function initSocketAuthControllerEvents(socket: Socket) {
    socket.on('auth', (dto: SocketAuthDto) => socketAuth(socket, dto))
}
