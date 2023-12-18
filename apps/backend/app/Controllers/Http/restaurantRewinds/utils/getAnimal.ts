const REWIND_ANIMALS = ['GAZELLE', 'BLAIREAU', 'PARESSEUX', 'MICROBE'] as const
export type RewindAnimal = typeof REWIND_ANIMALS[number]

export const getAnimal = (userId: number, rankingMap: Map<number, number>): RewindAnimal => {
    const ranking = rankingMap.get(userId)
    const maxRank = rankingMap.size
    const gazelleMaxRank = Math.round(maxRank * 0.3)
    const paresseuxMinRank = Math.round(maxRank * 0.7)

    if (!ranking) {
        return 'MICROBE'
    }

    if (ranking < gazelleMaxRank) {
        return 'GAZELLE'
    }

    if (ranking > paresseuxMinRank) {
        return 'PARESSEUX'
    }

    return 'BLAIREAU'
}
