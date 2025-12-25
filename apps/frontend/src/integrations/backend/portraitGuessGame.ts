import type { ApiError } from "@galadrim-tools/shared";
import { queryOptions } from "@tanstack/react-query";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

export type PortraitGuessGameGuess = {
    id: number;
    portraitGuessable: {
        pictureUrl: string;
        guess: string;
    };
};

export async function fetchPortraitGuessGameGuesses(): Promise<PortraitGuessGameGuess[]> {
    const res = await fetchBackendJson<PortraitGuessGameGuess[], ApiError>(
        "/portraitGuessGame",
        "GET",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de charger les portraits"));
    }

    return res.json;
}

export function portraitGuessGameGuessesQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.portraitGuessGame(),
        queryFn: fetchPortraitGuessGameGuesses,
        retry: false,
    });
}

export type GradePortraitGuessGameInput = {
    guessId: number;
    grade: 1 | 2 | 3 | 4;
};

export async function gradePortraitGuessGame(
    input: GradePortraitGuessGameInput,
): Promise<{ message: string }> {
    const res = await fetchBackendJson<{ message: string }, ApiError>(
        "/portraitGuessGame",
        "POST",
        {
            body: JSON.stringify(input),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible d'enregistrer la réponse"));
    }

    return res.json;
}

export async function refreshPortraitGuessGame(): Promise<{ message: string }> {
    const res = await fetchBackendJson<{ message: string }, ApiError>(
        "/portraitGuessGame/refresh",
        "POST",
        {
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de rafraîchir les portraits"));
    }

    return res.json;
}
