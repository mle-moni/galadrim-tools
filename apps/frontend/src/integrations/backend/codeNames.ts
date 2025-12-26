import type {
    ApiCodeNamesGame,
    ApiCodeNamesGameRound,
    ApiError,
    ApiMatrix,
    MatrixDto,
} from "@galadrim-tools/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

type ApiCodeNamesGameMaybeRounds = Omit<ApiCodeNamesGame, "rounds"> & {
    rounds?: ApiCodeNamesGameRound[];
};

function normalizeCodeNamesGame(game: ApiCodeNamesGameMaybeRounds): ApiCodeNamesGame {
    return { ...game, rounds: game.rounds ?? [] };
}

export async function fetchMatrices(): Promise<ApiMatrix[]> {
    const res = await fetchBackendJson<ApiMatrix[], ApiError>("/matrices", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les matrices"));
    }

    return res.json;
}

export function matricesQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.matrices(),
        queryFn: fetchMatrices,
        retry: false,
    });
}

export async function fetchCodeNamesGames(): Promise<ApiCodeNamesGame[]> {
    const res = await fetchBackendJson<ApiCodeNamesGame[], ApiError>("/codeNamesGames", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les parties"));
    }

    return res.json.map((game) => normalizeCodeNamesGame(game));
}

export function codeNamesGamesQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.codeNamesGames(),
        queryFn: fetchCodeNamesGames,
        retry: false,
    });
}

export type CreateCodeNamesGameInput = {
    redSpyMasterId: number;
    blueSpyMasterId: number;
    image: File;
};

type CreateCodeNamesGameResponse = { message: string; game: ApiCodeNamesGameMaybeRounds };

async function createCodeNamesGame(input: CreateCodeNamesGameInput): Promise<ApiCodeNamesGame> {
    const body = new FormData();
    body.append("redSpyMasterId", String(input.redSpyMasterId));
    body.append("blueSpyMasterId", String(input.blueSpyMasterId));
    body.append("image", input.image);

    const res = await fetchBackendJson<CreateCodeNamesGameResponse, ApiError>(
        "/codeNamesGames",
        "POST",
        { body },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer la partie"));
    }

    return normalizeCodeNamesGame(res.json.game);
}

export function useCreateCodeNamesGameMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateCodeNamesGameInput) => createCodeNamesGame(input),
        onSuccess: (game) => {
            queryClient.setQueryData<ApiCodeNamesGame[]>(queryKeys.codeNamesGames(), (old) => {
                if (!old) return [game];
                return [game, ...old.filter((g) => g.id !== game.id)];
            });
        },
    });
}

export type AddCodeNamesRoundInput = {
    gameId: number;
    spyMasterId: number;
    announce?: string;
    clueWord: string;
    clueNumber: number;
    matrix: MatrixDto;
};

type AddCodeNamesRoundResponse = { message: string; round: ApiCodeNamesGameRound };

async function addCodeNamesRound(input: AddCodeNamesRoundInput): Promise<ApiCodeNamesGameRound> {
    const body = new FormData();
    body.append("spyMasterId", String(input.spyMasterId));
    body.append("announce", input.announce ?? "");
    body.append("clueWord", input.clueWord);
    body.append("clueNumber", String(input.clueNumber));
    body.append("red", String(input.matrix.red));
    body.append("blue", String(input.matrix.blue));
    body.append("white", String(input.matrix.white));
    body.append("black", String(input.matrix.black));

    const res = await fetchBackendJson<AddCodeNamesRoundResponse, ApiError>(
        `/codeNamesGames/addRound/${input.gameId}`,
        "POST",
        { body },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible d'ajouter le round"));
    }

    return res.json.round;
}

export function useAddCodeNamesRoundMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: AddCodeNamesRoundInput) => addCodeNamesRound(input),
        onSuccess: (round) => {
            queryClient.setQueryData<ApiCodeNamesGame[]>(queryKeys.codeNamesGames(), (old) => {
                if (!old) return old;

                return old.map((game) => {
                    if (game.id !== round.gameId) return game;
                    const previousRounds = game.rounds ?? [];
                    return { ...game, rounds: [...previousRounds, round] };
                });
            });
        },
    });
}

export type DeleteCodeNamesGameInput = {
    gameId: number;
};

async function deleteCodeNamesGame(input: DeleteCodeNamesGameInput): Promise<{ message: string }> {
    const res = await fetchBackendJson<{ message: string }, ApiError>(
        `/codeNamesGames/${input.gameId}`,
        "DELETE",
        { headers: APPLICATION_JSON_HEADERS },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer la partie"));
    }

    return res.json;
}

export function useDeleteCodeNamesGameMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DeleteCodeNamesGameInput) => deleteCodeNamesGame(input),
        onSuccess: (_data, input) => {
            queryClient.setQueryData<ApiCodeNamesGame[]>(queryKeys.codeNamesGames(), (old) => {
                if (!old) return old;
                return old.filter((game) => game.id !== input.gameId);
            });
        },
    });
}
