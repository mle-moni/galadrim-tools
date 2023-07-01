import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { createOrUpdateCardFromDto } from 'App/Controllers/Http/cards/cardCreateUpdate/createOrUpdateCardFromDto'
import { cardDto } from 'App/Controllers/Http/cards/cardDto'

const creationSchema = schema.create({
    cardDto,
})

export const storeCard = async (ctx: HttpContextContract) => {
    await ctx.bouncer.with('RightsPolicy').authorize('hasRight', 'GALAGUERRE_ADMIN')

    const { cardDto } = await ctx.request.validate({ schema: creationSchema })

    const trx = await Database.transaction()

    try {
        const card = await createOrUpdateCardFromDto({ cardDto, ctx, trx })

        await trx.commit()

        return { message: `Nouvelle carte ${card.label}`, card }
    } catch (error) {
        await trx.rollback()
        throw error
    }
}
