import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { changePasswordRoute } from './routes/changePassword'
import { createApiTokenRoute } from './routes/getApiToken'
import { getOtpRoute } from './routes/getOtp'
import { loginRoute } from './routes/login'
import { logoutRoute } from './routes/logout'
import { meRoute } from './routes/me'

export default class EventsController {
    public async login(params: HttpContextContract) {
        return loginRoute(params)
    }

    public async logout(params: HttpContextContract) {
        return logoutRoute(params)
    }

    public async me(params: HttpContextContract) {
        return meRoute(params)
    }

    public async createApiToken(params: HttpContextContract) {
        return createApiTokenRoute(params)
    }

    public async getOtp(params: HttpContextContract) {
        return getOtpRoute(params)
    }

    public async changePassword(params: HttpContextContract) {
        return changePasswordRoute(params)
    }
}
