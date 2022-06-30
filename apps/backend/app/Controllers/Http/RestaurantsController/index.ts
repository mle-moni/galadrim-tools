import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { indexRoute } from './routes'
import { destroyRoute } from './routes/destroy'
import { showRoute } from './routes/show'
import { storeRoute } from './routes/store'
import { updateRoute } from './routes/update'

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
