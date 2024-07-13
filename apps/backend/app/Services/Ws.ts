import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'

class Ws {
    public io: Server
    private booted = false

    public boot() {
        /**
         * Ignore multiple calls to the boot method
         */
        if (this.booted) {
            return
        }

        this.booted = true
        this.io = new Server(server.instance!, {
            cors: {
                origin: '*',
            },
        })
    }
}

export default new Ws()
