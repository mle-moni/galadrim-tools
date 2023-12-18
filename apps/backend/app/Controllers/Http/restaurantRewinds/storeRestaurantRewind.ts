import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export const storeRestaurantReview = async ({ request, auth, params }: HttpContextContract) => {
    const user = auth.user!

    // return { message: 'Avis ajouté', restaurantReview }
}
