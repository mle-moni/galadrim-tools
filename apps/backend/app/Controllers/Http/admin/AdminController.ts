import { HttpContext } from '@adonisjs/core/http'
import { createNotificationRoute } from './createNotificationRoute.js'
import { createUserRoute } from './createUser.js'
import { editUserRightsRoute } from './editUserRights.js'
import { userRightsRoute } from './userRights.js'

export default class AdminController {
    public async createUser(params: HttpContext) {
        return createUserRoute(params)
    }

    public async userRights(params: HttpContext) {
        return userRightsRoute(params)
    }

    public async editUserRights(params: HttpContext) {
        return editUserRightsRoute(params)
    }

    public async createNotification(params: HttpContext) {
        return createNotificationRoute(params)
    }
}
