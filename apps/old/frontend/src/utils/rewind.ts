import type { RewindAdjective, RewindAnimal } from "@galadrim-tools/shared";

export const getRewindPositionLabel = (position: number | null, totalNumber: number) => {
    if (position === null) {
        return "";
    }

    if (position === 1) {
        return "premier";
    }

    if (position === 2) {
        return "deuxième";
    }

    if (position === 3) {
        return "troisième";
    }

    if (position === totalNumber) {
        return "dernier";
    }

    const percentagePosition = Math.round((position / totalNumber) * 100);

    return `${position}ème (top ${percentagePosition}%)`;
};

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const getAdjectiveFunnyLabel = (adjective?: RewindAdjective | null) => {
    switch (adjective) {
        case "RICHE":
            return "Vous dînez comme un roi !";
        case "MOYEN":
            return "Votre déjeuner est équilibré, comme votre budget !";
        case "PAUVRE":
            return "Un déjeuner à la mode étudiant, portefeuille en mode éco !";
        default:
            return "Tu sais que tu peux dire où tu manges ?";
    }
};

export const getAnimalFunnyLabel = (animal?: RewindAnimal | null) => {
    switch (animal) {
        case "GAZELLE":
            return "Vous parcourez Paris en long, en large et en travers pour votre délice gastronomique !";
        case "BLAIREAU":
            return "Vous fouillez les quartiers proches pour dénicher les perles culinaires.";
        case "PARESSEUX":
            return "Votre quête de nourriture ne vous éloigne jamais trop des locaux.";
        default:
            return "Tu sais que tu peux dire où tu manges ?";
    }
};
