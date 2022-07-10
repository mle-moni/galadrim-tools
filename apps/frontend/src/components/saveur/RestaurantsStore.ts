import { IRestaurant } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
import { notifyError } from '../../utils/notification'

export class RestaurantsStore {
    public restaurants: IRestaurant[] = []

    constructor() {
        makeAutoObservable(this)
    }

    setRestaurants(restaurants: IRestaurant[]) {
        this.restaurants = restaurants
    }

    async fetch() {
        const req = await fetchBackendJson<IRestaurant[], unknown>('/restaurants', 'GET')
        if (req.ok) {
            this.setRestaurants(req.json)
            return
        }
        notifyError('Impossible de récuperer les restaurants')
    }
}
