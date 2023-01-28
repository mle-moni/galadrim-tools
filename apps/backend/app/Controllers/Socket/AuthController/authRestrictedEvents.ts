import { IUserData, _assert } from '@galadrim-tools/shared'
import { Socket } from 'socket.io'
import { gameChat } from './tournois/gameChat'

export const getSocketUser = (socket: Socket) => {
    _assert(socket.data.user, 'socket user should be defined')
    return socket.data.user as Omit<IUserData, 'notifications' | 'dailyChoice'>
}

export const joinAuthRestrictedEvents = (socket: Socket) => {
    socket.on('debug', (...data) => {
        socket.emit('debug', ...data)
    })

    socket.on('gameChat', (data) => gameChat(socket, data))
}

export const partAuthRestrictedEvents = (socket: Socket) => {
    socket.removeAllListeners('debug')
}
