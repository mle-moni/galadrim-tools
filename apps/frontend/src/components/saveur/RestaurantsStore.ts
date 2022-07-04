import { Restaurant } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
import { notifyError } from '../../utils/notification'

export class RestaurantsStore {
    public restaurants: Restaurant[] = []

    constructor() {
        makeAutoObservable(this)
    }

    setRestaurants(restaurants: Restaurant[]) {
        this.restaurants = restaurants
    }

    async fetch() {
        const req = await fetchBackendJson<Restaurant[], unknown>('/restaurants', 'GET')
        if (req.ok) {
            this.setRestaurants(req.json)
            return
        }
        notifyError('Impossible de récuperer les restaurants')
    }
}
