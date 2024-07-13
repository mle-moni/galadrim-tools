import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

class WsClass {
  public _io: Server | null = null
  private booted = false

  public boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this._io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
    })
  }

  get io() {
    if (!this._io) {
      throw new Error('You must call Ws.boot() before using Ws.io')
    }
    return this._io
  }
}

export const Ws = new WsClass()
