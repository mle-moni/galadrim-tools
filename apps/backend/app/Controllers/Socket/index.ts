import { Socket } from 'socket.io'
import { initSocketAuthControllerEvents } from './AuthController'

export function setupEvents(socket: Socket) {
    initSocketAuthControllerEvents(socket)
}
