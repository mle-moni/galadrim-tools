import { schema } from '@ioc:Adonis/Core/Validator'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { minionCardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreMinion from 'App/Models/GalaguerreMinion'

const minionSchema = schema.create({
    cardDto: minionCardDto,
})

export const createGalaguerreMinion = async ({
    ctx,
}: GalaguerreCardCreationContext): Promise<GalaguerreMinion> => {
    const {
        cardDto: { minionDto },
    } = await ctx.request.validate({ schema: minionSchema })

    const minion = await GalaguerreMinion.create({
        attack: minionDto.attack,
        health: minionDto.health,
    })

    return minion
}
