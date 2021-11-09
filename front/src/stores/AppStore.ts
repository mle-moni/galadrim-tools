import { makeAutoObservable } from 'mobx'
import { fetchGaladrimeurs } from '../api/galadrimeurs'
import { AuthStore } from './AuthStore'
import { EventsStore } from './EventsStore'
import { NotificationStore } from './NotificationStore'

export class MainStore {
    public appIsReady = false

    public galadrimeurs: string[] = []

    public eventsStore = new EventsStore()

    public notification = new NotificationStore()

    public authStore = new AuthStore()

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    public setAppReady(state: boolean) {
        this.appIsReady = state
    }

    async init() {
        const [galadrimeurs] = await Promise.all([fetchGaladrimeurs(), this.authStore.init()])
        this.galadrimeurs = galadrimeurs
        this.setAppReady(true)
    }
}

export const AppStore = new MainStore()
