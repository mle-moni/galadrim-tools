import { HttpContext } from '@adonisjs/core/http'
import { indexRoute } from './galadrimeursIndex.js'
import { usersRoute } from './users.js'

export default class GaladrimeursController {
    public async index(params: HttpContext) {
        return indexRoute(params)
    }

    public async users(params: HttpContext) {
        return usersRoute(params)
    }
}
