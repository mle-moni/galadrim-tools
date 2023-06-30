import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { createCardSubType } from 'App/Controllers/Http/cards/cardCreateUpdate/createCardSubType'
import { createCardTags } from 'App/Controllers/Http/cards/cardCreateUpdate/createCardTags'
import { createOrUpdateGalaguerreCard } from 'App/Controllers/Http/cards/cardCreateUpdate/createOrUpdateGalaguerreCard'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'

export interface Params extends GalaguerreCardCreationContext {
    cardDto: CardDto
}

export const createOrUpdateCardFromDto = async (params: Params) => {
    const { cardDto, trx, cardId } = params
    if (cardId !== undefined) {
        // TODO delete all related tags, minions, spells, weapons
    }

    const cardSubType = await createCardSubType(cardDto.type, params)

    const card = await createOrUpdateGalaguerreCard(params, {
        type: cardDto.type,
        cardMode: cardDto.cardMode,
        cost: cardDto.cost,
        image: Attachment.fromFile(cardDto.image),
        label: cardDto.label,
        ...cardSubType,
    })

    await createCardTags({ card, cardTagIds: cardDto.cardTagIds, trx })

    return card
}
