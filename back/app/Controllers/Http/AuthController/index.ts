import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { loginRoute } from './routes/login'

export default class EventsController {
    public async login(params: HttpContextContract) {
        return loginRoute(params)
    }

    public async me(params: HttpContextContract) {
        return params.auth.user!.publicData()
    }
}
