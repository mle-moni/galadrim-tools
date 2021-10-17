import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { indexRoute } from './routes'

export default class GaladrimeursController {
    public async index(params: HttpContextContract) {
        return indexRoute(params)
    }
}
