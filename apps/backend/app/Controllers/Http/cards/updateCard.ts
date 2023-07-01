import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import { createOrUpdateCardFromDto } from 'App/Controllers/Http/cards/cardCreateUpdate/createOrUpdateCardFromDto'
import { cardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreCard from 'App/Models/GalaguerreCard'

const updateCardSchema = schema.create({
    cardDto,
})

export const updateCard = async (ctx: HttpContextContract) => {
    await ctx.bouncer.with('RightsPolicy').authorize('hasRight', 'GALAGUERRE_ADMIN')

    const cardToUpdate = await GalaguerreCard.findOrFail(ctx.params.id)

    const { cardDto } = await ctx.request.validate({ schema: updateCardSchema })

    const trx = await Database.transaction()

    try {
        const card = await createOrUpdateCardFromDto({ cardDto, ctx, trx, cardId: cardToUpdate.id })

        await trx.commit()

        return { message: 'Carte mise à jour', card }
    } catch (error) {
        await trx.rollback()
        throw error
    }
}
