import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { createCardComparison } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { TargetDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreTarget from 'App/Models/GalaguerreTarget'

export const createGalaguerreTarget = async ({
    targetDto,
    trx,
    boostOrActionId,
}: {
    targetDto: TargetDto
    trx: TransactionClientContract
    boostOrActionId: { boostId?: number; actionId?: number }
}) => {
    const comparison = await createCardComparison(targetDto.comparison, trx)
    const target = await GalaguerreTarget.create({
        comparisonId: comparison?.id ?? null,
        tagId: targetDto.tagId,
        type: targetDto.type,
        actionId: boostOrActionId.actionId ?? null,
        boostId: boostOrActionId.boostId ?? null,
    })

    return target
}
