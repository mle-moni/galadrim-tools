import { Socket } from 'socket.io'

export async function socketLogout(socket: Socket) {
    socket.data.user = undefined
    socket.leave('connectedSockets')
}
