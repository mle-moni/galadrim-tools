import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { queryOptions } from "@tanstack/react-query";

import { fetchBackendJson } from "./client";
import { queryKeys } from "./query-keys";

const PAGE_SIZE = 100;

async function fetchAdominModel<TModel>(model: string): Promise<TModel[]> {
    const res = await fetchBackendJson<{ data: TModel[] }, unknown>(
        `/adomin/api/models/crud/${model}?pageIndex=1&pageSize=${PAGE_SIZE}`,
        "GET",
    );

    if (!res.ok) {
        throw new Error(`Impossible de récupérer ${model}`);
    }

    return res.json.data;
}

export function officesQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.offices(),
        queryFn: () => fetchAdominModel<ApiOffice>("Office"),
        retry: false,
    });
}

export function officeFloorsQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.officeFloors(),
        queryFn: () => fetchAdominModel<ApiOfficeFloor>("OfficeFloor"),
        retry: false,
    });
}

export function officeRoomsQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.officeRooms(),
        queryFn: () => fetchAdominModel<ApiOfficeRoom>("OfficeRoom"),
        retry: false,
    });
}
