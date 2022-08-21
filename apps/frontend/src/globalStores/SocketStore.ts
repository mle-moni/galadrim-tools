import { IRestaurant, ITag } from '@galadrim-tools/shared'
import { io, Socket } from 'socket.io-client'
import { getEventFromApi } from '../api/events'
import { getSocketApiUrl } from '../api/fetch'
import { notifyError, notifySuccess } from '../utils/notification'
import { AppStore } from './AppStore'
import { RawRoomEvent } from './EventsStore'

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
        this._socket = io(getSocketApiUrl())
        this.setupEvents()
    }

    disconnect() {
        this.socket.emit('logout')
        this.socket.removeAllListeners()
        this.socket.close()
        this._socket = null
    }

    setupEvents() {
        this.socket.on('auth', () => this.socketAuth())
        this.socket.on('error', (msg) => this.error(msg))
        this.socket.on('success', (msg) => this.success(msg))
        this.socket.on('createEvent', (event) => this.createEvent(event))
        this.socket.on('updateEvent', (event) => this.updateEvent(event))
        this.socket.on('deleteEvent', (event) => this.deleteEvent(event))
        this.socket.on('createTag', (restaurant) => this.createRestaurant(restaurant))
        this.socket.on('createRestaurant', (restaurant) => this.createRestaurant(restaurant))
        this.socket.on('updateRestaurant', (restaurant) => this.updateRestaurant(restaurant))
        this.socket.on('deleteRestaurant', ({ id }: { id: number }) => this.deleteRestaurant(id))
        this.socket.on('fetchAll', () => AppStore.fetchAll())
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

    createEvent(eventRaw: RawRoomEvent) {
        AppStore.eventsStore.appendEvents([getEventFromApi(eventRaw)])
    }

    updateEvent(eventRaw: RawRoomEvent) {
        const events = [...AppStore.eventsStore.events]
        const event = events.find((event) => event.id === eventRaw.id)
        if (!event) return
        AppStore.eventsStore.updateEvent(event, getEventFromApi(eventRaw))
        AppStore.eventsStore.setEvents(events)
    }

    deleteEvent({ id }: RawRoomEvent) {
        const events = AppStore.eventsStore.events.filter((event) => event.id !== id)
        AppStore.eventsStore.setEvents(events)
    }

    createRestaurant(restaurant: IRestaurant) {
        AppStore.saveurStore.restaurantsStore.addRestaurant(restaurant)
    }

    createTag(tag: ITag) {
        AppStore.saveurStore.tagsStore.pushTag(tag)
    }

    updateRestaurant(restaurant: IRestaurant) {
        AppStore.saveurStore.restaurantsStore.editRestaurant(restaurant)
    }

    deleteRestaurant(id: number) {
        AppStore.saveurStore.restaurantsStore.deleteRestaurant(id)
    }
}
