import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from '../../../../Models/Restaurant'

export const showRoute = ({ params }: HttpContextContract) => {
    return Restaurant.findOrFail(params.id)
}
