import Tag from '#models/tag'
import { HttpContext } from '@adonisjs/core/http'

export const indexRoute = async (_params: HttpContext) => {
  return Tag.all()
}
