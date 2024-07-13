import { HttpContext } from '@adonisjs/core/http'
import Tag from '#app/Models/Tag'

export const showRoute = ({ params }: HttpContext) => {
    return Tag.findOrFail(params.id)
}
