import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import GalaguerreCard from 'App/Models/GalaguerreCard'
import GalaguerreCardTag from 'App/Models/GalaguerreCardTag'

interface Params {
    card: GalaguerreCard
    cardTagIds: number[]
    trx: TransactionClientContract
}

export const createCardTags = async ({ card, cardTagIds, trx }: Params) => {
    const createdTags = await GalaguerreCardTag.createMany(
        cardTagIds.map((tagId) => ({ tagId, cardId: card.id })),
        { client: trx }
    )

    return createdTags
}
