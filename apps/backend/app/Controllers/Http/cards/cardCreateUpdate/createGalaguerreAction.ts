import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { createGalaguerreTarget } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreTarget'
import {
    ActionDto,
    NullableCardFilterDto,
    NullableComparisonDto,
    NullableMinionPowerDto,
} from 'App/Controllers/Http/cards/cardDto'
import GalaguerreAction from 'App/Models/GalaguerreAction'
import GalaguerreCardFilter from 'App/Models/GalaguerreCardFilter'
import GalaguerreCardFilterTag from 'App/Models/GalaguerreCardFilterTag'
import GalaguerreComparison from 'App/Models/GalaguerreComparison'
import GalaguerreMinionPower from 'App/Models/GalaguerreMinionPower'

export const createGalaguerreAction = async ({
    actionDto,
    trx,
}: {
    actionDto: ActionDto
    trx: TransactionClientContract
}) => {
    const [minionPower, cardFilter, enemyCardFilter] = await Promise.all([
        createMinionPower(actionDto.minionPower, trx),
        createCardFilter(actionDto.drawCardFilter, trx),
        createCardFilter(actionDto.enemyDrawCardFilter, trx),
    ])

    const action = await GalaguerreAction.create(
        {
            type: actionDto.type,
            isTargeted: actionDto.isTargeted,
            drawCount: actionDto.drawCount,
            drawCardFilterId: cardFilter?.id ?? null,
            enemyDrawCount: actionDto.enemyDrawCount,
            enemyDrawCardFilterId: enemyCardFilter?.id ?? null,
            damage: actionDto.damage,
            heal: actionDto.heal,
            attackBoost: actionDto.attackBoost,
            healthBoost: actionDto.healthBoost,
            minionPowerId: minionPower?.id ?? null,
        },
        { client: trx }
    )

    const boostOrActionId = { actionId: action.id }

    await Promise.all(
        actionDto.targets.map((targetDto) =>
            createGalaguerreTarget({ targetDto, trx, boostOrActionId })
        )
    )

    return action
}

export const createMinionPower = async (
    dto: NullableMinionPowerDto,
    trx: TransactionClientContract
) => {
    if (!dto) return null

    return GalaguerreMinionPower.create(
        {
            hasTaunt: dto.hasTaunt,
            hasCharge: dto.hasCharge,
            hasWindfury: dto.hasWindfury,
            isPoisonous: dto.isPoisonous,
        },
        { client: trx }
    )
}

export const createCardFilter = async (
    dto: NullableCardFilterDto,
    trx: TransactionClientContract
) => {
    if (!dto) return null

    const comparison = await createCardComparison(dto.comparison, trx)

    const cardFilter = await GalaguerreCardFilter.create(
        {
            type: dto.type,
            comparisonId: comparison?.id ?? null,
        },
        { client: trx }
    )

    await GalaguerreCardFilterTag.createMany(
        dto.cardTagIds.map((tagId) => ({ tagId, cardFilterId: cardFilter.id })),
        { client: trx }
    )

    return cardFilter
}

export const createCardComparison = async (
    dto: NullableComparisonDto,
    trx: TransactionClientContract
) => {
    if (!dto) return null

    return GalaguerreComparison.create(
        {
            cost: dto.cost,
            costComparison: dto.costComparison,
            attack: dto.attack,
            attackComparison: dto.attackComparison,
            health: dto.health,
            healthComparison: dto.healthComparison,
        },
        { client: trx }
    )
}
