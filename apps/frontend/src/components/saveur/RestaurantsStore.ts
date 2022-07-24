import { IRestaurant } from '@galadrim-rooms/shared'
import Fuse from 'fuse.js'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
import { notifyError } from '../../utils/notification'

const fuseSettings: Fuse.IFuseOptions<IRestaurant> = {
    includeScore: true,
    keys: ['name', 'description', 'tags.name'],
}
export class RestaurantsStore {
    private _fuseInstance: Fuse<IRestaurant> = new Fuse([], fuseSettings)

    restaurants: IRestaurant[] = []

    search = ''

    restaurantClicked?: IRestaurant = undefined

    constructor() {
        makeAutoObservable(this)
    }

    setRestaurants(restaurants: IRestaurant[]) {
        this.restaurants = restaurants
        this.refreshFuse()
    }

    refreshFuse() {
        this._fuseInstance = new Fuse(this.restaurants, fuseSettings)
    }

    async fetch() {
        const req = await fetchBackendJson<IRestaurant[], unknown>('/restaurants', 'GET')
        if (req.ok) {
            this.setRestaurants(req.json)
            return
        }
        notifyError('Impossible de récuperer les restaurants')
    }

    setSearch(str: string) {
        this.search = str
    }

    get fuseInstance() {
        return this._fuseInstance
    }

    setRestaurantClicked(resto?: IRestaurant) {
        this.restaurantClicked = resto
        if (resto) {
            this.setSearch('')
        }
    }

    addRestaurant(restaurant: IRestaurant) {
        this.restaurants.push(restaurant)
        this.refreshFuse()
    }

    editRestaurant(restaurant: IRestaurant) {
        const restaurantFound = this.restaurants.find(({ id }) => restaurant.id === id)
        if (!restaurantFound) {
            this.addRestaurant(restaurant)
            return
        }
        restaurantFound.name = restaurant.name
        restaurantFound.description = restaurant.description
        restaurantFound.lat = restaurant.lat
        restaurantFound.lng = restaurant.lng
        restaurantFound.tags = restaurant.tags.map(({ id, name }) => ({ id, name }))
        if (restaurant.image === null) {
            restaurantFound.image = null
            return
        }
        restaurantFound.image = { ...restaurant.image }
        this.refreshFuse()
    }
}
