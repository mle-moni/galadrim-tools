import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { cardDto } from 'App/Controllers/Http/cards/cardDto'

const creationSchema = schema.create({
    cardDto,
})

export const storeCard = async ({ request }: HttpContextContract) => {
    const { cardDto } = await request.validate({ schema: creationSchema })

    return { message: 'todo' }
}
