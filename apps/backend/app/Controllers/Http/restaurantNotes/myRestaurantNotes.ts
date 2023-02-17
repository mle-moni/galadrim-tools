import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const myRestaurantNotes = async ({ auth }: HttpContextContract) => {
    const user = auth.user!

    await user.load('notes')

    return user.notes
}
