import { makeAutoObservable } from 'mobx'

export class NotificationsAdminStore {
    constructor() {
        makeAutoObservable(this)
    }

    async createNotification() {
        console.log('TODO')
    }

    get canCreateNotification() {
        return true
    }
}
