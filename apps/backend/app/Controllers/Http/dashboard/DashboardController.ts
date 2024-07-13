import { hasRights } from '@galadrim-tools/shared'
import type { HttpContext } from '@adonisjs/core/http'
import { getDashboardInfos } from './getDashboardInfos.js'

export default class DashboardController {
    public index({ auth, response }: HttpContext) {
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
