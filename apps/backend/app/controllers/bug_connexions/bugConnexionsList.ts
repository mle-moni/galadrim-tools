import BugConnexion from '#models/bug_connexion'
import { HttpContext } from '@adonisjs/core/http'

export const bugConnexionsList = async ({}: HttpContext) => {
  const bugConnexions = await BugConnexion.all()

  return bugConnexions
}
