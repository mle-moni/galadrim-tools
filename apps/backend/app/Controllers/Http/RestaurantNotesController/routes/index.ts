import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RestaurantNote from '../../../../Models/RestaurantNote'

export const indexRoute = async (_params: HttpContextContract) => {
    return RestaurantNote.all()
}
