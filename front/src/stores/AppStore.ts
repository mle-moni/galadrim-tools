import { makeAutoObservable } from "mobx"
import { fetchGaladrimeurs } from "../api/galadrimeurs"
import { EventsStore } from "./EventsStore"


export class MainStore {
    public appIsReady = false

    public galadrimeurs: string[] = []

    public eventsStore = new EventsStore()

    public username = localStorage.getItem('username') || ''

    setUsername(username: string) {
        this.username = username
        localStorage.setItem('username', username)
    }

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    public setAppReady(state: boolean) {
        this.appIsReady = state
    }

    async init() {
        const [galadrimeurs] = await Promise.all([fetchGaladrimeurs(), this.eventsStore.init()])
        this.galadrimeurs = galadrimeurs
        this.setAppReady(true)
    }
}

export const AppStore = new MainStore()

//@ts-ignore
window.appStore = AppStore
