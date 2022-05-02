import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createUserRoute } from './routes/createUser'

export default class AdminController {
    public async createUser(params: HttpContextContract) {
        return createUserRoute(params)
    }
}
