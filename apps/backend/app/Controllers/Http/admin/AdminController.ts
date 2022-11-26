import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { createUserRoute } from './createUser'
import { editUserRightsRoute } from './editUserRights'
import { userRightsRoute } from './userRights'

export default class AdminController {
    public async createUser(params: HttpContextContract) {
        return createUserRoute(params)
    }

    public async userRights(params: HttpContextContract) {
        return userRightsRoute(params)
    }

    public async editUserRights(params: HttpContextContract) {
        return editUserRightsRoute(params)
    }
}
