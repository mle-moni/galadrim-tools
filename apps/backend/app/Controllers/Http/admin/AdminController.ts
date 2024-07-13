import { HttpContext } from '@adonisjs/core/http'
import { createNotificationRoute } from './createNotificationRoute'
import { createUserRoute } from './createUser'
import { editUserRightsRoute } from './editUserRights'
import { userRightsRoute } from './userRights'

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
