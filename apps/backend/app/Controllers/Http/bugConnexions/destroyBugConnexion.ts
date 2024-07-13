import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BugConnexion from '#app/Models/BugConnexion'
import { validateResourceId } from '#app/Scaffolder/validateResourceId'

export const destroyBugConnexion = async ({ params, bouncer }: HttpContextContract) => {
    const { id } = await validateResourceId(params)
    const bugConnexion = await BugConnexion.findOrFail(id)

    await bouncer.with('RestaurantsPolicy').authorize('viewUpdateOrDelete', bugConnexion)

    const deletedId = bugConnexion.id

    await bugConnexion.delete()

    return { message: 'BugConnexion deleted', deletedId }
}
