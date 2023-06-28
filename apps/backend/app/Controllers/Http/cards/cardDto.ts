import { GALAGUERRE_CARD_MODES, GALAGUERRE_CARD_TYPES } from '@galadrim-tools/shared'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export const cardDto = schema.object().members({
    label: schema.string([rules.trim(), rules.maxLength(80)]),
    cardMode: schema.enum(GALAGUERRE_CARD_MODES),
    cost: schema.number([rules.unsigned()]),
    image: schema.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
    type: schema.enum(GALAGUERRE_CARD_TYPES),

    cardTagIds: schema
        .array()
        .members(schema.number([rules.exists({ table: 'galaguerre_tags', column: 'id' })])),
})

export type CardDto = typeof cardDto.t
