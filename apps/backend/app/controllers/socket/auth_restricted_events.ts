import { IUserData, _assert } from '@galadrim-tools/shared'
import { Socket } from 'socket.io'
import { gameChat } from './tournois/gameChat.js'
import { livePlayers, livePos } from './tournois/livePos.js'
import { scoreTournois } from './tournois/scoreTournois.js'

export const getSocketUser = (socket: Socket) => {
  _assert(socket.data.user, 'socket user should be defined')
  return socket.data.user as Omit<IUserData, 'notifications' | 'dailyChoice'>
}

export const joinAuthRestrictedEvents = (socket: Socket) => {
  socket.on('debug', (...data) => {
    socket.emit('debug', ...data)
  })

  socket.on('gameChat', (data) => gameChat(socket, data))
  socket.on('scoreTournois', (data, mapId) => scoreTournois(socket, data, mapId))
  socket.on('livePos', (data, password) => livePos(socket, data, password))
  socket.on('disconnect', () => {
    const user = getSocketUser(socket)
    if (livePlayers.hasOwnProperty(user.username)) {
      delete livePlayers[user.username]
      socket.broadcast.emit('deletePlayer', user.username)
    }
  })
}

export const partAuthRestrictedEvents = (socket: Socket) => {
  socket.removeAllListeners('debug')
  socket.removeAllListeners('gameChat')
  socket.removeAllListeners('scoreTournois')
  socket.removeAllListeners('livePos')
  socket.removeAllListeners('disconnect')
}
