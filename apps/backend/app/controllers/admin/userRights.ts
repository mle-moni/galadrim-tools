import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export const userRightsRoute = async ({}: HttpContext) => {
  const users = await User.all()
  return users.map((user) => user.getRightsData())
}
