import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from '../../../../Models/Tag'

export const showRoute = ({ params }: HttpContextContract) => {
    return Tag.findOrFail(params.id)
}
