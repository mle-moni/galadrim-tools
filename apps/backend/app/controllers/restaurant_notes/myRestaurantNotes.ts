import { HttpContext } from '@adonisjs/core/http'

export const myRestaurantNotes = async ({ auth }: HttpContext) => {
  const user = auth.user!

  await user.load('notes')

  return user.notes
}
