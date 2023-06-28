import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { createCardTags } from 'App/Controllers/Http/cards/cardCreation/createCardTags'
import {
    CreateOrUpdateGalaguerreCardParams,
    createOrUpdateGalaguerreCard,
} from 'App/Controllers/Http/cards/cardCreation/createOrUpdateGalaguerreCard'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'

export interface Params extends CreateOrUpdateGalaguerreCardParams {
    cardDto: CardDto
}

export const createOrUpdateCardFromDto = async ({ cardDto, trx, cardId }: Params) => {
    // TODO create minion OR spell OR weapon before creating card
    const card = await createOrUpdateGalaguerreCard(
        { trx, cardId },
        {
            type: cardDto.type,
            cardMode: cardDto.cardMode,
            cost: cardDto.cost,
            image: Attachment.fromFile(cardDto.image),
            label: cardDto.label,
            minionId: null,
            spellId: null,
            weaponId: null,
        }
    )

    await createCardTags({ card, cardTagIds: cardDto.cardTagIds, trx })

    return card
}
