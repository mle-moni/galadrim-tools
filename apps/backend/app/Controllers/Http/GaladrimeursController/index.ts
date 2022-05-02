import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { indexRoute } from './routes'
import { usersRoute } from './routes/users'

export default class GaladrimeursController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async users(params: HttpContextContract) {
        return usersRoute(params)
    }
}
