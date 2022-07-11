import { _assert } from '@galadrim-rooms/shared'
import L from 'leaflet'
import { makeAutoObservable } from 'mobx'
import { RestaurantsStore } from './RestaurantsStore'

export class SaveurStore {
    private _leafletMap?: L.Map = undefined

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

    initLeafletMap(leafletMap: L.Map) {
        this._leafletMap = leafletMap
    }

    get leafletMap() {
        _assert(this._leafletMap, 'you must initLeafletMap before using leafletMap')
        return this._leafletMap
    }
}
