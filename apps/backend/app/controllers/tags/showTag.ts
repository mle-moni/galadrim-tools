import Tag from '#models/tag'
import { HttpContext } from '@adonisjs/core/http'

export const showRoute = ({ params }: HttpContext) => {
  return Tag.findOrFail(params.id)
}
