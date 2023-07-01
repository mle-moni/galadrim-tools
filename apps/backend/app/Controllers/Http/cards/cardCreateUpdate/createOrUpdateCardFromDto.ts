import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { createCardSubType } from 'App/Controllers/Http/cards/cardCreateUpdate/createCardSubType'
import { createCardTags } from 'App/Controllers/Http/cards/cardCreateUpdate/createCardTags'
import { createOrUpdateGalaguerreCard } from 'App/Controllers/Http/cards/cardCreateUpdate/createOrUpdateGalaguerreCard'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { CardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreAction from 'App/Models/GalaguerreAction'
import GalaguerreCard from 'App/Models/GalaguerreCard'
import GalaguerreMinion from 'App/Models/GalaguerreMinion'
import GalaguerreSpell from 'App/Models/GalaguerreSpell'
import GalaguerreWeapon from 'App/Models/GalaguerreWeapon'

export interface Params extends GalaguerreCardCreationContext {
    cardDto: CardDto
}

export const createOrUpdateCardFromDto = async (params: Params) => {
    const { cardDto, trx, cardId } = params
    if (cardId !== undefined) {
        await deleteOldCardRelatedThings(cardId, trx)
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

// TODO not everything is deleted here, fix it
const deleteOldCardRelatedThings = async (cardId: number, trx: TransactionClientContract) => {
    const oldCard = await GalaguerreCard.query({ client: trx })
        .where('id', cardId)
        .preload('spell')
        .preload('minion', (q) => q.preload('battlecries').preload('deathrattles'))
        .firstOrFail()

    const promises: Promise<unknown>[] = []

    if (oldCard.minionId !== null) {
        const battclecryActionIds = oldCard.minion.battlecries.map(({ actionId }) => actionId)
        const deathrattleActionIds = oldCard.minion.deathrattles.map(({ actionId }) => actionId)
        const actionIds = [...battclecryActionIds, ...deathrattleActionIds]

        promises.push(
            GalaguerreMinion.query({ client: trx }).where('id', oldCard.minionId).delete(),
            GalaguerreAction.query({ client: trx }).whereIn('id', actionIds).delete()
        )
    }
    if (oldCard.spellId !== null) {
        promises.push(
            GalaguerreSpell.query({ client: trx }).where('id', oldCard.spellId).delete(),
            GalaguerreAction.query({ client: trx }).where('id', oldCard.spell.id).delete()
        )
    }
    if (oldCard.weaponId !== null) {
        promises.push(
            GalaguerreWeapon.query({ client: trx }).where('id', oldCard.weaponId).delete()
        )
    }

    await Promise.all(promises)
}
