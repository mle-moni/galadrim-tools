export const NOTES_VALUES = {
    1: '🤮',
    2: '😕',
    3: '😶',
    4: '😁',
    5: '😍',
} as const

export type NotesOption = keyof typeof NOTES_VALUES
