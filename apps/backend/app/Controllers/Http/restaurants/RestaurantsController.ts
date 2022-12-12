import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyRoute } from 'App/Controllers/Http/restaurants/destroyRestaurant'
import { indexRoute } from 'App/Controllers/Http/restaurants/restaurantsIndex'
import { showRoute } from 'App/Controllers/Http/restaurants/showRestaurant'
import { storeRoute } from 'App/Controllers/Http/restaurants/storeRestaurant'
import { updateRoute } from 'App/Controllers/Http/restaurants/updateRestaurant'
import { createOrUpdateChoiceRoute } from './createOrUpdateChoice'

export default class RestaurantsController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async store(params: HttpContextContract) {
        return storeRoute(params)
    }

    public async show(params: HttpContextContract) {
        return showRoute(params)
    }

    public async update(params: HttpContextContract) {
        return updateRoute(params)
    }

    public async destroy(params: HttpContextContract) {
        return destroyRoute(params)
    }

    public async createOrUpdateChoice(params: HttpContextContract) {
        return createOrUpdateChoiceRoute(params)
    }
}
