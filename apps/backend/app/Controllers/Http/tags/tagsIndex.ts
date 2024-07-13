import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from '#app/Models/Tag'

export const indexRoute = async (_params: HttpContextContract) => {
    return Tag.all()
}
