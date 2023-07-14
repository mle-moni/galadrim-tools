import {
    GALAGUERRE_ACTIONS_TYPES,
    GALAGUERRE_CARD_MODES,
    GALAGUERRE_CARD_TYPES,
    GALAGUERRE_COMPARISONS,
    GALAGUERRE_TARGET_TYPES,
} from '@galadrim-tools/shared'
import { z } from 'zod'

const zMinionPower = z.object({
    hasTaunt: z.boolean(),
    hasCharge: z.boolean(),
    hasWindfury: z.boolean(),
    isPoisonous: z.boolean(),
})

const zComparison = z.object({
    costComparison: z.enum(GALAGUERRE_COMPARISONS),
    cost: z.number(),
    attackComparison: z.enum(GALAGUERRE_COMPARISONS),
    attack: z.number(),
    healthComparison: z.enum(GALAGUERRE_COMPARISONS),
    health: z.number(),
})

const zCardFilter = z.object({
    type: z.enum(GALAGUERRE_CARD_TYPES),
    comparison: z.nullable(zComparison),
    cardTagIds: z.array(z.number()),
})

const zTarget = z.object({
    type: z.enum(GALAGUERRE_TARGET_TYPES),
    tagId: z.nullable(z.number()),
    comparison: zComparison,
})

const zBoost = z.object({
    health: z.number(),
    attack: z.number(),
    spellPower: z.number(),
    minionPower: z.nullable(zMinionPower),
})

const zAction = z.object({
    type: z.enum(GALAGUERRE_ACTIONS_TYPES),
    isTargeted: z.boolean(),
    drawCount: z.number(),
    drawCardFilter: z.nullable(zCardFilter),
    enemyDrawCount: z.number(),
    enemyDrawCardFilter: zCardFilter,
    damage: z.number(),
    heal: z.number(),
    targets: z.array(zTarget),
    boost: zBoost,
})

const zMinion = z.object({
    health: z.number(),
    attack: z.number(),
    minionPower: zMinionPower,
    battlecries: z.array(zAction),
})

export const zCardForm = z.object({
    label: z.string(),
    cost: z.number(),
    type: z.enum(GALAGUERRE_CARD_TYPES),
    cardMode: z.enum(GALAGUERRE_CARD_MODES),
    minion: z.nullable(zMinion),
})

export type CardForm = z.infer<typeof zCardForm>
