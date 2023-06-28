import { GalaguerreCardMode, GalaguerreCardType } from '@galadrim-tools/shared'
import { AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import GalaguerreCard from 'App/Models/GalaguerreCard'

interface CardCreationObject {
    cardMode: GalaguerreCardMode
    cost: number
    image: AttachmentContract
    label: string
    type: GalaguerreCardType
    minionId: number | null
    spellId: number | null
    weaponId: number | null
}

export const createOrUpdateGalaguerreCard = async (
    { trx, cardId }: GalaguerreCardCreationContext,
    cardCreationObject: CardCreationObject
) => {
    if (cardId === undefined) {
        return GalaguerreCard.create(cardCreationObject, { client: trx })
    }
    return GalaguerreCard.updateOrCreate({ id: cardId }, cardCreationObject, { client: trx })
}
