import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { indexRoute } from './galadrimeursIndex'
import { usersRoute } from './users'

export default class GaladrimeursController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }

    public async users(params: HttpContextContract) {
        return usersRoute(params)
    }
}
