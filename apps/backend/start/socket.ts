import { Socket } from 'socket.io'
import { setupEvents } from '../app/Controllers/Socket/index.js'
import Ws from '../app/Services/Ws.js'
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
