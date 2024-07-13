import { HttpContext } from '@adonisjs/core/http'
import { myRestaurantNotes } from '#app/Controllers/Http/restaurantNotes/myRestaurantNotes'
import { destroyRoute } from './destroyRestaurantNotes.js'
import { indexRoute } from './restaurantNotesIndex.js'
import { showRoute } from './showRestaurantNotes.js'
import { storeOrUpdateRoute } from './storeOrUpdateRestaurantNotes.js'

export default class RestaurantsController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async store(params: HttpContext) {
        return storeOrUpdateRoute(params)
    }

    public async show(params: HttpContext) {
        return showRoute(params)
    }

    public async update(params: HttpContext) {
        return storeOrUpdateRoute(params)
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params)
    }

    public async mine(params: HttpContext) {
        return myRestaurantNotes(params)
    }
}
