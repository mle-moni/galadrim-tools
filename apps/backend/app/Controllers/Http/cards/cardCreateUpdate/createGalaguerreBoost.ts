import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { createMinionPower } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { NullableBoostDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreBoost from 'App/Models/GalaguerreBoost'

export const createGalaguerreBoost = async (
    boostDto: NullableBoostDto,
    trx: TransactionClientContract
) => {
    if (!boostDto) return null

    const minionPower = await createMinionPower(boostDto.minionPower, trx)

    const boost = await GalaguerreBoost.create(
        {
            attack: boostDto.attack,
            health: boostDto.health,
            spellPower: boostDto.spellPower,
            minionPowerId: minionPower?.id ?? null,
        },
        { client: trx }
    )

    return boost
}
