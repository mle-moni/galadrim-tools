export const GALAGUERRE_COMPARISONS = ['<', '>', '='] as const
export type GalaguerreComparison = typeof GALAGUERRE_COMPARISONS[number]

export const GALAGUERRE_CARD_TYPES = ['MINION', 'SPELL', 'WEAPON'] as const
export type GalaguerreCardType = typeof GALAGUERRE_CARD_TYPES[number]

export const GALAGUERRE_ACTIONS_TYPES = [
    'DAMAGE',
    'DAMAGE',
    'HEAL',
    'BOOST',
    'MINION_POWERS',
    'DRAW',
    'ENEMY_DRAW',
] as const
export type GalaguerreActionType = typeof GALAGUERRE_ACTIONS_TYPES[number]

export const GALAGUERRE_BOOST_TYPES = ['STATS', 'MINION_POWERS'] as const
export type GalaguerreBoostType = typeof GALAGUERRE_BOOST_TYPES[number]

export const GALAGUERRE_PASSIVES_TYPES = ['ACTION', 'BOOST'] as const
export type GalaguerrePassiveType = typeof GALAGUERRE_PASSIVES_TYPES[number]

export const GALAGUERRE_PASSIVES_TRIGGERS_ON = ['TURN_END', 'TURN_BEGIN', 'DRAW', 'HEAL'] as const
export type GalaguerrePassiveTriggersOn = typeof GALAGUERRE_PASSIVES_TRIGGERS_ON[number]

export const GALAGUERRE_TARGET_TYPES = ['ALL', 'HERO', 'MINION'] as const
export type GalaguerreTargetType = typeof GALAGUERRE_TARGET_TYPES[number]

export const GALAGUERRE_CARD_MODES = ['CREATION', 'BETA', 'PROD'] as const
export type GalaguerreCardMode = typeof GALAGUERRE_CARD_MODES[number]
