import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BugConnexion from '#app/Models/BugConnexion'
import { validateResourceId } from '#app/Scaffolder/validateResourceId'

export const showBugConnexion = async ({ params, bouncer }: HttpContextContract) => {
    const { id } = await validateResourceId(params)
    const bugConnexion = await BugConnexion.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', bugConnexion)

    return bugConnexion
}
