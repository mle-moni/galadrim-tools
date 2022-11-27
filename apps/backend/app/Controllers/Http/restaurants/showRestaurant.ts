import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from 'App/Models/Restaurant'

export const showRoute = async ({ params }: HttpContextContract) => {
    const restaurant = await Restaurant.fetchById(params.id)
    return restaurant
}
