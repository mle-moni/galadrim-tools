export const RIGHTS = {
    DEFAULT: 0b0,
    USER_ADMIN: 0b1,
    EVENT_ADMIN: 0b10,
    RIGHTS_ADMIN: 0b100,
    MIAM_ADMIN: 0b1000,
    DASHBOARD_ADMIN: 0b10000,
} as const

export type AllRights = keyof typeof RIGHTS

export const hasRights = (rights: number, rightsWanted: AllRights[]) => {
    return rightsWanted.every((right) => (right === 'DEFAULT' || rights & RIGHTS[right]) !== 0)
}

export const hasSomeRights = (rights: number, rightsWanted: AllRights[]) => {
    return rightsWanted.some((right) => hasRights(rights, [right]))
}

export const generateRights = (rightsWanted: AllRights[]) => {
    const rightsSet = new Set(rightsWanted)
    const rights = Array.from(rightsSet)
    return rights.reduce<number>((acc, curr) => acc + RIGHTS[curr], RIGHTS.DEFAULT)
}
