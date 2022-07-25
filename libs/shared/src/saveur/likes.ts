export const LIKES_VALUES = {
    1: '🤮',
    2: '😕',
    3: '😶',
    4: '😁',
    5: '😍',
} as const

export type LikeOptions = keyof typeof LIKES_VALUES
