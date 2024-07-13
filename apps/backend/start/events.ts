import { Ws } from '#services/ws'
import emitter from '@adonisjs/core/services/emitter'

emitter.on('http:server_ready', () => {
  Ws.boot()

  /**
   * Listen for incoming socket connections
   */
  Ws.io.on('connection', (socket) => {
    socket.emit('auth', 'request') // asks socket to authenticate
  })
})
