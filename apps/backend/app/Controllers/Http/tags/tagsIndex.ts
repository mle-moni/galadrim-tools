import { HttpContext } from '@adonisjs/core/http'
import Tag from '#app/Models/Tag'

export const indexRoute = async (_params: HttpContext) => {
    return Tag.all()
}
