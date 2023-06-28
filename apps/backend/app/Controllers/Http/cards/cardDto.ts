import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { GALAGUERRE_CARD_MODES } from 'libs/shared/dist'

export const cardDto = schema.object().members({
    label: schema.string([rules.trim(), rules.maxLength(80)]),
    cardMode: schema.enum(GALAGUERRE_CARD_MODES),
    cost: schema.number([rules.unsigned()]),
    image: schema.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
    minionId: schema.number.nullable([rules.exists({ column: 'id', table: 'galaguerre_minions' })]),
    spellId: schema.number.nullable([rules.exists({ column: 'id', table: 'galaguerre_spells' })]),
    weaponId: schema.number.nullable([rules.exists({ column: 'id', table: 'galaguerre_weapons' })]),
})

export type CardDto = typeof cardDto.t
