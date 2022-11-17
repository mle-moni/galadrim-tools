import { makeAutoObservable } from 'mobx'
import { NavigateFunction } from 'react-router-dom'
import { fetchUsers, UserData } from '../api/galadrimeurs'
import { IdeasStore } from '../pages/idea/IdeasStore'
import { AuthStore } from './AuthStore'
import { EventsStore } from './EventsStore'
import { NotificationStore } from './NotificationStore'
import { SaveurStore } from './SaveurStore'
import { SocketStore } from './SocketStore'

export class MainStore {
    private _navigate: NavigateFunction | null = null

    public appIsReady = false

    public users = new Map<number, UserData>()

    public eventsStore = new EventsStore()

    public saveurStore = new SaveurStore()

    public notification = new NotificationStore()

    public authStore = new AuthStore()

    public socketStore = new SocketStore()

    public ideaStore = new IdeasStore()

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    public setUsersMap(state: Map<number, UserData>) {
        this.users = state
    }

    public setAppReady(state: boolean) {
        this.appIsReady = state
    }

    public setNavigation(navigate: NavigateFunction) {
        this._navigate = navigate
    }

    public navigate(path: string) {
        if (!this._navigate) throw new Error('You must set navigation first')
        this._navigate(path)
    }

    async init() {
        const [users] = await Promise.all([fetchUsers(), this.authStore.init()])
        this.setUsersMap(new Map<number, UserData>(users.map((user) => [user.id, user])))
        this.setAppReady(true)
    }

    async fetchAll() {
        this.saveurStore.init()
        this.eventsStore.fetchEvents()
        const users = await fetchUsers()
        this.setUsersMap(new Map<number, UserData>(users.map((user) => [user.id, user])))
    }

    addUser(user: UserData) {
        this.users.set(user.id, user)
    }

    updateUser(user: UserData) {
        const userFound = this.users.get(user.id)
        if (!userFound) {
            this.addUser(user)
            return
        }
        userFound.username = user.username
        userFound.imageUrl = user.imageUrl
    }
}

export const AppStore = new MainStore()
