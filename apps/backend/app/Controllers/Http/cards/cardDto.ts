import {
    GALAGUERRE_ACTIONS_TYPES,
    GALAGUERRE_CARD_MODES,
    GALAGUERRE_CARD_TYPES,
    GALAGUERRE_COMPARISONS,
    GALAGUERRE_PASSIVES_TRIGGERS_ON,
    GALAGUERRE_PASSIVES_TYPES,
    GALAGUERRE_TARGET_TYPES,
} from '@galadrim-tools/shared'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export const cardTagIdsDto = schema
    .array()
    .members(schema.number([rules.exists({ table: 'galaguerre_tags', column: 'id' })]))

export const cardDto = schema.object().members({
    label: schema.string([rules.trim(), rules.maxLength(80)]),
    cardMode: schema.enum(GALAGUERRE_CARD_MODES),
    cost: schema.number([rules.unsigned()]),
    image: schema.file({ size: '2mb', extnames: ['jpg', 'png', 'jpeg'] }),
    type: schema.enum(GALAGUERRE_CARD_TYPES),

    cardTagIds: cardTagIdsDto,
})

export type CardDto = typeof cardDto.t

export const nullableMinionPowerDto = schema.object.nullable().members({
    hasTaunt: schema.boolean(),
    hasCharge: schema.boolean(),
    hasWindfury: schema.boolean(),
    isPoisonous: schema.boolean(),
})

export type NullableMinionPowerDto = typeof nullableMinionPowerDto.t

const nullableComparisonDto = schema.object.nullable().members({
    costComparison: schema.enum.nullable(GALAGUERRE_COMPARISONS),
    cost: schema.number(),
    attackComparison: schema.enum.nullable(GALAGUERRE_COMPARISONS),
    attack: schema.number(),
    healthComparison: schema.enum.nullable(GALAGUERRE_COMPARISONS),
    health: schema.number(),
})
export type NullableComparisonDto = typeof nullableComparisonDto.t

export const nullableCardFilterDto = schema.object.nullable().members({
    type: schema.enum(GALAGUERRE_CARD_TYPES),
    comparison: nullableComparisonDto,
    cardTagIds: cardTagIdsDto,
})
export type NullableCardFilterDto = typeof nullableCardFilterDto.t

const targetDto = schema.object().members({
    type: schema.enum(GALAGUERRE_TARGET_TYPES),
    tagId: schema.number([rules.exists({ table: 'galaguerre_tags', column: 'id' })]),
    comparison: nullableComparisonDto,
})
export type TargetDto = typeof targetDto.t

export const nullableBoostDto = schema.object.nullable().members({
    health: schema.number(),
    attack: schema.number(),
    spellPower: schema.number(),
    minionPower: nullableMinionPowerDto,
})
export type NullableBoostDto = typeof nullableBoostDto.t

const ACTION_PROPERTIES = {
    type: schema.enum(GALAGUERRE_ACTIONS_TYPES),
    isTargeted: schema.boolean(),
    drawCount: schema.number(),
    drawCardFilter: nullableCardFilterDto,
    enemyDrawCount: schema.number(),
    enemyDrawCardFilter: nullableCardFilterDto,
    damage: schema.number(),
    heal: schema.number(),
    targets: schema.array().members(targetDto),
    boost: nullableBoostDto,
}

export const actionDto = schema.object().members(ACTION_PROPERTIES)
export type ActionDto = typeof actionDto.t
export const nullableActionDto = schema.object.nullable().members(ACTION_PROPERTIES)

export const passiveDto = schema.object().members({
    type: schema.enum(GALAGUERRE_PASSIVES_TYPES),
    triggersOn: schema.enum(GALAGUERRE_PASSIVES_TRIGGERS_ON),
    action: nullableActionDto,
    boost: nullableBoostDto,
})
export type PassiveDto = typeof passiveDto.t

export const minionCardDto = schema.object().members({
    minionDto: schema.object().members({
        attack: schema.number([rules.unsigned()]),
        health: schema.number([rules.unsigned()]),
        minionPower: nullableMinionPowerDto,
        battlecries: schema.array().members(actionDto),
        deathrattles: schema.array().members(actionDto),
        passives: schema.array().members(passiveDto),
    }),
})

export type MinionCardDto = typeof minionCardDto.t

export const spellCardDto = schema.object().members({
    spellDto: schema.object().members({
        action: actionDto,
    }),
})

export type SpellCardDto = typeof spellCardDto.t
