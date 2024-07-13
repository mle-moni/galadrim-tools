import { HttpContext } from '@adonisjs/core/http'
import { indexRoute } from './galadrimeursIndex'
import { usersRoute } from './users'

export default class GaladrimeursController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async users(params: HttpContext) {
        return usersRoute(params)
    }
}
