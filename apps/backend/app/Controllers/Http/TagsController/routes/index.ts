import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from '../../../../Models/Tag'

export const indexRoute = async (_params: HttpContextContract) => {
    return Tag.all()
}
