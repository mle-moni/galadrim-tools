import { Socket } from 'socket.io'

export function initSocketAuthControllerEvents(socket: Socket) {
    socket.on('auth', (msg) => console.log(msg))
}
