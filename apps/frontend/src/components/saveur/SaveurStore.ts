import { makeAutoObservable } from 'mobx'
import { RestaurantsStore } from './RestaurantsStore'

export class SaveurStore {
    leftMenuIsOpen = false

    isReady = false

    restaurantsStore = new RestaurantsStore()

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    async init() {
        await this.restaurantsStore.fetch()
        this.setIsReady(true)
    }

    async setIsReady(state: boolean) {
        this.isReady = state
    }

    setLeftMenuIsOpen(state: boolean) {
        this.leftMenuIsOpen = state
    }

    toggeleftMenu() {
        this.setLeftMenuIsOpen(!this.leftMenuIsOpen)
    }
}
