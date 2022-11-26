import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { destroyRoute } from 'App/Controllers/Http/events/destroyEvent'
import { indexRoute } from 'App/Controllers/Http/events/eventsIndex'
import { showRoute } from 'App/Controllers/Http/events/showEvent'
import { storeRoute } from 'App/Controllers/Http/events/storeEvent'
import { updateRoute } from 'App/Controllers/Http/events/updateEvent'

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
}
