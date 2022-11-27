import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyRoute } from './destroyRestaurantNotes'
import { indexRoute } from './restaurantNotesIndex'
import { showRoute } from './showRestaurantNotes'
import { storeOrUpdateRoute } from './storeOrUpdateRestaurantNotes'

export default class RestaurantsController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async store(params: HttpContextContract) {
        return storeOrUpdateRoute(params)
    }

    public async show(params: HttpContextContract) {
        return showRoute(params)
    }

    public async update(params: HttpContextContract) {
        return storeOrUpdateRoute(params)
    }

    public async destroy(params: HttpContextContract) {
        return destroyRoute(params)
    }
}
