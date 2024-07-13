import BugConnexion from '#models/bug_connexion'
import { HttpContext } from '@adonisjs/core/http'
import { validateResourceId } from '../../helpers/validate_resource_id.js'

export const destroyBugConnexion = async ({ params, bouncer }: HttpContext) => {
  const { id } = await validateResourceId(params)
  const bugConnexion = await BugConnexion.findOrFail(id)

  await bouncer.with('ResourcePolicy').authorize('viewUpdateOrDelete', bugConnexion)

  const deletedId = bugConnexion.id

  await bugConnexion.delete()

  return { message: 'BugConnexion deleted', deletedId }
}
