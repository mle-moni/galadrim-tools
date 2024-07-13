import { Socket } from 'socket.io'
import { initSocketAuthControllerEvents } from './AuthController/index.js'

export function setupEvents(socket: Socket) {
    initSocketAuthControllerEvents(socket)
}
