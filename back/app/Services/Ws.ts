import AdonisServer from '@ioc:Adonis/Core/Server'
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
        this.io = new Server(AdonisServer.instance!, {
            cors: {
                origin: '*',
            },
        })
    }
}

export default new Ws()
