import { io, Socket } from 'socket.io-client'
import { getApiUrl } from '../api/fetch'
import { notifyError, notifySuccess } from '../utils/notification'
import { AppStore } from './AppStore'

export class SocketStore {
    private _socket: Socket | null = null

    get socket() {
        if (!this._socket) {
            throw new Error('you must call connect() before accessing to socket')
        }
        return this._socket
    }

    connect() {
        if (this._socket) return
        this._socket = io(getApiUrl())
        this.setupEvents()
    }

    setupEvents() {
        this.socket.on('auth', () => this.socketAuth())
        this.socket.on('error', (msg) => this.error(msg))
        this.socket.on('success', (msg) => this.success(msg))
    }

    socketAuth() {
        this.socket.emit('auth', {
            userId: AppStore.authStore.user.id,
            socketToken: AppStore.authStore.user.socketToken,
        })
    }

    error(msg: string) {
        notifyError(msg)
    }

    success(msg: string) {
        notifySuccess(msg)
    }
}
