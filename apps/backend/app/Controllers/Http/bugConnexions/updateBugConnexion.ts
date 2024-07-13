import { HttpContext } from '@adonisjs/core/http'
import BugConnexion from '#app/Models/BugConnexion'
import { validateResourceId } from '#app/Scaffolder/validateResourceId'
import { bugConnexionSchema } from './bugConnexionSchema.js'

export const updateBugConnexion = async ({ params, request, bouncer }: HttpContext) => {
    const { id } = await validateResourceId(params)
    const { details, networkName, room } = await request.validate({ schema: bugConnexionSchema })
    const foundBugConnexion = await BugConnexion.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', foundBugConnexion)

    const updatedBugConnexion = await BugConnexion.updateOrCreate(
        { id },
        { details, networkName, room }
    )

    return { message: 'BugConnexion updated', updatedBugConnexion }
}
