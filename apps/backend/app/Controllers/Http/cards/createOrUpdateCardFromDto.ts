import { Attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreCard from 'App/Models/GalaguerreCard'
import { GalaguerreCardMode } from 'libs/shared/dist'

interface Params {
    cardId?: number
    cardDto: CardDto
    trx: TransactionClientContract
}

interface CardCreationObject {
    cardMode: GalaguerreCardMode
    cost: number
    image: AttachmentContract
    label: string
    minionId: number | null
    spellId: number | null
    weaponId: number | null
}

const createOrUpdate = async (
    { trx, cardId }: Omit<Params, 'cardDto'>,
    cardCreationObject: CardCreationObject
) => {
    if (cardId === undefined) {
        return GalaguerreCard.create(cardCreationObject, { client: trx })
    }
    return GalaguerreCard.updateOrCreate({ id: cardId }, cardCreationObject, { client: trx })
}

export const createOrUpdateCardFromDto = async ({ cardDto, trx, cardId }: Params) => {
    const cardCreationObject = {
        cardMode: cardDto.cardMode,
        cost: cardDto.cost,
        image: Attachment.fromFile(cardDto.image),
        label: cardDto.label,
        minionId: cardDto.minionId,
        spellId: cardDto.spellId,
        weaponId: cardDto.weaponId,
    }

    const card = await createOrUpdate({ trx, cardId }, cardCreationObject)

    return card
}
