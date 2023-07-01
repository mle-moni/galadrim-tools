import { schema } from '@ioc:Adonis/Core/Validator'
import { createGalaguerreAction } from 'App/Controllers/Http/cards/cardCreateUpdate/createGalaguerreAction'
import { GalaguerreCardCreationContext } from 'App/Controllers/Http/cards/cardCreateUpdate/galaguerre.creation.types'
import { weaponCardDto } from 'App/Controllers/Http/cards/cardDto'
import GalaguerreWeapon from 'App/Models/GalaguerreWeapon'
import GalaguerreWeaponDeathrattleAction from 'App/Models/GalaguerreWeaponDeathrattleAction'

const weaponSchema = schema.create({
    cardDto: weaponCardDto,
})

export const createGalaguerreWeapon = async ({
    ctx,
    trx,
}: GalaguerreCardCreationContext): Promise<GalaguerreWeapon> => {
    const {
        cardDto: { weaponDto },
    } = await ctx.request.validate({ schema: weaponSchema })

    const weapon = await GalaguerreWeapon.create(
        { damage: weaponDto.damage, durability: weaponDto.durability },
        { client: trx }
    )

    const actions = await Promise.all(
        weaponDto.deathrattles.map((actionDto) => createGalaguerreAction(actionDto, trx))
    )

    await GalaguerreWeaponDeathrattleAction.createMany(
        actions.map((action) => ({
            weaponId: weapon.id,
            actionId: action.id,
        })),
        { client: trx }
    )

    return weapon
}
