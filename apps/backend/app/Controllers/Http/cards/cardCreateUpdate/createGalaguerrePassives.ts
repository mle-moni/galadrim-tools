import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { createGalaguerreAction } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { createGalaguerreBoost } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreBoost'
import { PassiveDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreMinionPassive from 'App/Models/GalaguerreMinionPassive'
import GalaguerrePassive from 'App/Models/GalaguerrePassive'

export const createGalaguerrePassive = async ({
    passiveDto,
    trx,
    minionId,
}: {
    minionId: number | null
    passiveDto: PassiveDto
    trx: TransactionClientContract
}) => {
    const action = passiveDto.action ? await createGalaguerreAction(passiveDto.action, trx) : null
    const boost = await createGalaguerreBoost(passiveDto.boost, trx)

    const passive = await GalaguerrePassive.create(
        {
            triggersOn: passiveDto.triggersOn,
            type: passiveDto.type,
            actionId: action?.id ?? null,
            boostId: boost?.id ?? null,
        },
        { client: trx }
    )

    if (minionId) {
        await GalaguerreMinionPassive.create(
            {
                minionId,
                passiveId: passive.id,
            },
            { client: trx }
        )
    }

    return passive
}
