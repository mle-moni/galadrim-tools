import { schema } from '@ioc:Adonis/Core/Validator'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import {
    createGalaguerreAction,
    createMinionPower,
} from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { ActionDto, minionCardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreMinion from 'App/Models/GalaguerreMinion'
import GalaguerreMinionBattlecryAction from 'App/Models/GalaguerreMinionBattlecryAction'
import GalaguerreMinionDeathrattleAction from 'App/Models/GalaguerreMinionDeathrattleAction'

const minionSchema = schema.create({
    cardDto: minionCardDto,
})

export const createGalaguerreMinion = async ({
    ctx,
    trx,
}: GalaguerreCardCreationContext): Promise<GalaguerreMinion> => {
    const {
        cardDto: { minionDto },
    } = await ctx.request.validate({ schema: minionSchema })

    const minionPower = await createMinionPower(minionDto.minionPower, trx)

    const minion = await GalaguerreMinion.create(
        {
            attack: minionDto.attack,
            health: minionDto.health,
            minionPowerId: minionPower?.id ?? null,
        },
        { client: trx }
    )

    const battlecriesPromises = minionDto.battlecries.map((actionDto) =>
        createMinionBattlecryOrDeathrattle({
            minion,
            actionDto,
            trx,
            ClassToCreate: GalaguerreMinionBattlecryAction,
        })
    )

    const deathrattlesPromises = minionDto.deathrattles.map((actionDto) =>
        createMinionBattlecryOrDeathrattle({
            minion,
            actionDto,
            trx,
            ClassToCreate: GalaguerreMinionDeathrattleAction,
        })
    )

    const promises = [...battlecriesPromises, ...deathrattlesPromises]

    await Promise.all(promises)

    return minion
}

export const createMinionBattlecryOrDeathrattle = async ({
    actionDto,
    minion,
    trx,
    ClassToCreate,
}: {
    minion: GalaguerreMinion
    actionDto: ActionDto
    trx: TransactionClientContract
    ClassToCreate: typeof GalaguerreMinionDeathrattleAction | typeof GalaguerreMinionBattlecryAction
}) => {
    const action = await createGalaguerreAction({ actionDto, trx })

    const battleCryOrDeathrattle = await ClassToCreate.create(
        {
            actionId: action.id,
            minionId: minion.id,
        },
        { client: trx }
    )

    return battleCryOrDeathrattle
}
