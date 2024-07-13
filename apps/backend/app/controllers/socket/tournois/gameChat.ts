import { Socket } from 'socket.io'
import { getSocketUser } from '../auth_restricted_events.js'

export const gameChat = (socket: Socket, txt: unknown) => {
  const user = getSocketUser(socket)
  if (typeof txt !== 'string' || txt === '' || /^ *$/.test(txt) || txt.length > 1000) {
    return
  }
  const data = { psd: user.username, txt: txt }
  socket.broadcast.emit('gameChat', data)
  socket.emit('gameChat', data)
}
