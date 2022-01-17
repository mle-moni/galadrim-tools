import { makeAutoObservable } from 'mobx'
import { fetchGaladrimeurs, fetchUsers, UserData } from '../api/galadrimeurs'
import { AuthStore } from './AuthStore'
import { EventsStore } from './EventsStore'
import { NotificationStore } from './NotificationStore'
import { SocketStore } from './SocketStore'

export class MainStore {
    public appIsReady = false

    public galadrimeurs: string[] = []

    public users = new Map<number, UserData>()

    public eventsStore = new EventsStore()

    public notification = new NotificationStore()

    public authStore = new AuthStore()

    public socketStore = new SocketStore()

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    public setAppReady(state: boolean) {
        this.appIsReady = state
    }

    async init() {
        const [galadrimeurs, users] = await Promise.all([
            fetchGaladrimeurs(),
            fetchUsers(),
            this.authStore.init(),
        ])
        this.galadrimeurs = galadrimeurs
        this.users = new Map<number, UserData>(users.map((user) => [user.id, user]))
        this.setAppReady(true)
    }
}

export const AppStore = new MainStore()
