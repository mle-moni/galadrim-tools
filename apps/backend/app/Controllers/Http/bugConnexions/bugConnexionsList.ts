import { HttpContext } from '@adonisjs/core/http'
import BugConnexion from '#app/Models/BugConnexion'

export const bugConnexionsList = async ({}: HttpContext) => {
  const bugConnexions = await BugConnexion.all()

  return bugConnexions
}
