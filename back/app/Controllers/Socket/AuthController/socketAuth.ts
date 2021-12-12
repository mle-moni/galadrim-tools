import User from 'App/Models/User'
import { Socket } from 'socket.io'
import { validateInput } from '../utils/validation/validateInput'

export type SocketAuthDto = {
    userId: number
    socketToken: string
}

const BAD_AUTH_REQUEST = `Mauvaises données d'authentification`

export async function socketAuth(socket: Socket, dto: SocketAuthDto) {
    const isValid = validateInput(dto, {
        keys: [
            { key: 'userId', cases: ['#number'] },
            { key: 'socketToken', cases: ['#string'] },
        ],
    })
    if (!isValid) {
        return socket.emit('error', BAD_AUTH_REQUEST)
    }
    const user = await User.find(dto.userId)
    if (!user || user.socketToken !== dto.socketToken) {
        return socket.emit('error', BAD_AUTH_REQUEST)
    }
    socket.data.user = user.toJSON()
    socket.join('connectedSockets')
    socket.emit('success', 'Mises à jour en temps réél activées')
}
