import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BugConnexion from 'App/Models/BugConnexion'

export const bugConnexionsList = async ({}: HttpContextContract) => {
  const bugConnexions = await BugConnexion.all()

  return bugConnexions
}
