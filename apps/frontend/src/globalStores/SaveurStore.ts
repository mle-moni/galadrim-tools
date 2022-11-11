import { IRestaurant, _assert } from '@galadrim-tools/shared'
import L from 'leaflet'
import { makeAutoObservable } from 'mobx'
import { RestaurantsStore } from './RestaurantsStore'
import { TagsStore } from './TagsStore'

export const MAX_ZOOM = 18
export class SaveurStore {
    private _leafletMap?: L.Map = undefined

    leftMenuIsOpen = false

    isReady = false

    restaurantsStore = new RestaurantsStore()
    tagsStore = new TagsStore()

    constructor() {
        makeAutoObservable(this)
        this.init()
    }

    async init() {
        await this.restaurantsStore.fetch()
        await this.tagsStore.fetch()
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

    flyToRestaurantId(restaurantId: IRestaurant['id']) {
        const matchingRestaurant = this.restaurantsStore.getRestaurant(restaurantId)
        if (matchingRestaurant) {
            this.flyToRestaurant(matchingRestaurant)
        }
    }

    flyToRestaurant(restaurant: IRestaurant) {
        const { lat, lng } = restaurant
        this.restaurantsStore.setRestaurantClicked(restaurant)
        this.leafletMap.flyTo({ lat, lng }, MAX_ZOOM)
    }
}
