import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from '../../../../Models/Restaurant'

export const indexRoute = async (_params: HttpContextContract) => {
    return Restaurant.all()
}
