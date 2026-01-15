import type { ApiError, ApiOfficeRoom } from "@galadrim-tools/shared";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";

type AdominModelResponse<TModel> = {
    message: string;
    model: TModel;
};

type AdominDeleteResponse = {
    message: string;
    id: number;
};

export type CreateOfficeRoomInput = {
    name: string;
    config: string;
    officeFloor: number;
    isBookable: boolean;
    isPhonebox: boolean;
    hasTv: boolean;
};

export async function createOfficeRoom(input: CreateOfficeRoomInput): Promise<ApiOfficeRoom> {
    const res = await fetchBackendJson<AdominModelResponse<ApiOfficeRoom>, ApiError>(
        "/adomin/api/models/crud/OfficeRoom",
        "POST",
        {
            body: JSON.stringify(input),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer la salle"));
    }

    return res.json.model;
}

export type UpdateOfficeRoomInput = {
    id: number;
    name: string;
    config: string;
    officeFloor: number;
    isBookable: boolean;
    isPhonebox: boolean;
    hasTv: boolean;
};

export async function updateOfficeRoom(input: UpdateOfficeRoomInput): Promise<ApiOfficeRoom> {
    const { id, ...payload } = input;

    const res = await fetchBackendJson<AdominModelResponse<ApiOfficeRoom>, ApiError>(
        `/adomin/api/models/crud/OfficeRoom/${id}`,
        "PUT",
        {
            body: JSON.stringify(payload),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de modifier la salle"));
    }

    return res.json.model;
}

export async function deleteOfficeRoom(id: number): Promise<AdominDeleteResponse> {
    const res = await fetchBackendJson<AdominDeleteResponse, ApiError>(
        `/adomin/api/models/crud/OfficeRoom/${id}`,
        "DELETE",
        { headers: APPLICATION_JSON_HEADERS },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer la salle"));
    }

    return res.json;
}
