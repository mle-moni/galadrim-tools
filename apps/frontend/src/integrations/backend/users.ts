import { queryOptions } from "@tanstack/react-query";

import { fetchBackendJson } from "./client";
import { queryKeys } from "./query-keys";

export type ApiUserShort = {
    id: number;
    username: string;
    imageUrl: string;
};

async function fetchUsers(): Promise<ApiUserShort[]> {
    const res = await fetchBackendJson<ApiUserShort[], unknown>("/users", "GET");

    if (!res.ok) {
        throw new Error("Impossible de récupérer les utilisateurs");
    }

    return res.json;
}

export function usersQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.users(),
        queryFn: fetchUsers,
        retry: false,
    });
}
