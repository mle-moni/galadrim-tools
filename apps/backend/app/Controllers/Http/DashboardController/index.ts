import { hasRights } from '@galadrim-rooms/shared'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { getDashboardInfos } from './getDashboardInfos'

export default class DashboardController {
    public index({ auth, response }: HttpContextContract) {
        const user = auth.user!

        if (!hasRights(user.rights, ['DASHBOARD_ADMIN'])) {
            return response.unauthorized({
                error: `Vous n'avez pas les droits requis pour accéder à cette ressource`,
            })
        }

        const dashboardInfos = getDashboardInfos()

        return dashboardInfos
    }
}
