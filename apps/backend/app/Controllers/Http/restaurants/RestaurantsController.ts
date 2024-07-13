import { HttpContext } from '@adonisjs/core/http'
import { destroyRoute } from '#app/Controllers/Http/restaurants/destroyRestaurant'
import { indexRoute } from '#app/Controllers/Http/restaurants/restaurantsIndex'
import { showRoute } from '#app/Controllers/Http/restaurants/showRestaurant'
import { storeRoute } from '#app/Controllers/Http/restaurants/storeRestaurant'
import { updateRoute } from '#app/Controllers/Http/restaurants/updateRestaurant'
import { createOrUpdateChoiceRoute } from './createOrUpdateChoice.js'

export default class RestaurantsController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async store(params: HttpContext) {
        return storeRoute(params)
    }

    public async show(params: HttpContext) {
        return showRoute(params)
    }

    public async update(params: HttpContext) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContext) {
        return destroyRoute(params)
    }

    public async createOrUpdateChoice(params: HttpContext) {
        return createOrUpdateChoiceRoute(params)
    }
}
