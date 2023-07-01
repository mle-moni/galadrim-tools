import { schema } from '@ioc:Adonis/Core/Validator'
import { createGalaguerreAction } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { spellCardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreSpell from 'App/Models/GalaguerreSpell'

const spellSchema = schema.create({
    cardDto: spellCardDto,
})

export const createGalaguerreSpell = async ({
    ctx,
    trx,
}: GalaguerreCardCreationContext): Promise<GalaguerreSpell> => {
    const {
        cardDto: { spellDto },
    } = await ctx.request.validate({ schema: spellSchema })

    const action = await createGalaguerreAction(spellDto.action, trx)

    const spell = await GalaguerreSpell.create(
        {
            actionId: action.id,
        },
        { client: trx }
    )

    return spell
}
