import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createApiTokenRoute } from './routes/getApiToken'
import { loginRoute } from './routes/login'
import { logoutRoute } from './routes/logout'

export default class EventsController {
    public async login(params: HttpContextContract) {
        return loginRoute(params)
    }

    public async logout(params: HttpContextContract) {
        return logoutRoute(params)
    }

    public async me(params: HttpContextContract) {
        return params.auth.user!.publicData()
    }

    public createApiToken(params: HttpContextContract) {
        return createApiTokenRoute(params)
    }
}
