import { HttpContext } from '@adonisjs/core/http'
import { changePasswordRoute } from './changePassword.js'
import { createApiTokenRoute } from './getApiToken.js'
import { getOtpRoute } from './getOtp.js'
import { loginRoute } from './login.js'
import { logoutRoute } from './logout.js'
import { meRoute } from './me.js'
import { readNotifications } from './readNotifications.js'
import { updateNotificationsSettings } from './updateNotificationsSettings.js'
import { updateProfileRoute } from './updateProfile.js'
import { updateThemeRoute } from './updateTheme.js'

export default class EventsController {
    public async login(params: HttpContext) {
        return loginRoute(params)
    }

    public async logout(params: HttpContext) {
        return logoutRoute(params)
    }

    public async me(params: HttpContext) {
        return meRoute(params)
    }

    public async createApiToken(params: HttpContext) {
        return createApiTokenRoute(params)
    }

    public async getOtp(params: HttpContext) {
        return getOtpRoute(params)
    }

    public async changePassword(params: HttpContext) {
        return changePasswordRoute(params)
    }

    public async updateProfile(params: HttpContext) {
        return updateProfileRoute(params)
    }

    public async updateNotificationsSettings(params: HttpContext) {
        return updateNotificationsSettings(params)
    }

    public async readNotifications(params: HttpContext) {
        return readNotifications(params)
    }

    public async updateTheme(params: HttpContext) {
        return updateThemeRoute(params)
    }
}
