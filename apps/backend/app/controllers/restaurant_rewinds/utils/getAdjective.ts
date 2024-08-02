import type { RewindAdjective } from "@galadrim-tools/shared";

export const getAdjective = (userId: number, rankingMap: Map<number, number>): RewindAdjective => {
    const ranking = rankingMap.get(userId);
    const maxRank = rankingMap.size;
    const richeMaxRank = Math.round(maxRank * 0.3);
    const pauvreMinRank = Math.round(maxRank * 0.7);

    if (!ranking) {
        return "INSIGNIFIANT";
    }

    if (ranking < richeMaxRank) {
        return "RICHE";
    }

    if (ranking > pauvreMinRank) {
        return "PAUVRE";
    }

    return "MOYEN";
};
