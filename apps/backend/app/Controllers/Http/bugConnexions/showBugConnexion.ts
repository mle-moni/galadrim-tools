import { HttpContext } from '@adonisjs/core/http'
import BugConnexion from '#app/Models/BugConnexion'
import { validateResourceId } from '#app/Scaffolder/validateResourceId'

export const showBugConnexion = async ({ params, bouncer }: HttpContext) => {
    const { id } = await validateResourceId(params)
    const bugConnexion = await BugConnexion.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', bugConnexion)

    return bugConnexion
}
