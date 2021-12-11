import { setupEvents } from 'App/Controllers/Socket'
import Ws from 'App/Services/Ws'
import { Socket } from 'socket.io'
Ws.boot()

function initSocketAuth(socket: Socket) {
    socket.emit('auth', 'request')
}
/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
    initSocketAuth(socket) // asks socket to authenticate
    setupEvents(socket)
})
