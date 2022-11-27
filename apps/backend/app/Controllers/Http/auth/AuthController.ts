import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { changePasswordRoute } from './changePassword'
import { createApiTokenRoute } from './getApiToken'
import { getOtpRoute } from './getOtp'
import { loginRoute } from './login'
import { logoutRoute } from './logout'
import { meRoute } from './me'
import { updateProfileRoute } from './updateProfile'

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

    public async updateProfile(params: HttpContextContract) {
        return updateProfileRoute(params)
    }
}
