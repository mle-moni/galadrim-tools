import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { createCardTags } from 'App/Controllers/Http/cards/cardCreateUpdate/createCardTags'
import { createGalaguerreMinion } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreMinion'
import { createOrUpdateGalaguerreCard } from 'App/Controllers/Http/cards/cardCreateUpdate/createOrUpdateGalaguerreCard'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'

export interface Params extends GalaguerreCardCreationContext {
    cardDto: CardDto
}

export const createOrUpdateCardFromDto = async (params: Params) => {
    const { cardDto, trx, cardId, ctx } = params
    if (cardId !== undefined) {
        // TODO delete all related tags, minions, spells, weapons
    }

    // TODO create minion OR spell OR weapon before creating card

    switch (cardDto.type) {
        case 'MINION':
            await createGalaguerreMinion()
            break
        default:
            return ctx.response.badRequest({ error: `Type ${cardDto.type} not implemented` })
    }

    const card = await createOrUpdateGalaguerreCard(params, {
        type: cardDto.type,
        cardMode: cardDto.cardMode,
        cost: cardDto.cost,
        image: Attachment.fromFile(cardDto.image),
        label: cardDto.label,
        minionId: null,
        spellId: null,
        weaponId: null,
    })

    await createCardTags({ card, cardTagIds: cardDto.cardTagIds, trx })

    return card
}
