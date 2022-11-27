import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Restaurant from 'App/Models/Restaurant'

export const indexRoute = async (_params: HttpContextContract) => {
    return Restaurant.query().preload('tags').preload('notes')
}
