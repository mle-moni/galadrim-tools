import type { ApiError, ApiRoomReservation, IUserData } from "@galadrim-tools/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

export type ApiReservationUser = {
    id: number;
    username: string;
    imageUrl?: string;
    image?: unknown;
};

export type ApiRoomReservationWithUser = ApiRoomReservation & {
    user?: ApiReservationUser;
};

export type CreateRoomReservationInput = {
    start: Date;
    end: Date;
    officeRoomId: number;
};

export type UpdateRoomReservationInput = {
    id: number;
    start: Date;
    end: Date;
    officeRoomId: number;
    title: string;
};

type RoomReservationMutationResponse = {
    message: string;
    reservation: ApiRoomReservationWithUser;
};

type RoomReservationDeleteResponse = {
    message: string;
    deletedId: number;
};

async function fetchRoomReservations(officeId: number, dayIso: string) {
    const params = new URLSearchParams();
    params.append("range[]", dayIso);

    const res = await fetchBackendJson<ApiRoomReservationWithUser[], ApiError>(
        `/offices/${officeId}/reservations?${params}`,
        "GET",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les réservations"));
    }

    return res.json;
}

export function roomReservationsQueryOptions(officeId: number, dayIso: string) {
    return queryOptions({
        queryKey: queryKeys.roomReservations(officeId, dayIso),
        queryFn: () => fetchRoomReservations(officeId, dayIso),
        retry: false,
    });
}

async function createRoomReservation(officeId: number, input: CreateRoomReservationInput) {
    const res = await fetchBackendJson<RoomReservationMutationResponse, ApiError>(
        `/offices/${officeId}/reservations`,
        "POST",
        {
            body: JSON.stringify({
                officeRoomId: input.officeRoomId,
                start: input.start.toISOString(),
                end: input.end.toISOString(),
            }),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de créer la réservation"));
    }

    return res.json;
}

async function updateRoomReservation(officeId: number, input: UpdateRoomReservationInput) {
    const res = await fetchBackendJson<RoomReservationMutationResponse, ApiError>(
        `/offices/${officeId}/reservations/${input.id}`,
        "PUT",
        {
            body: JSON.stringify({
                officeRoomId: input.officeRoomId,
                title: input.title,
                start: input.start.toISOString(),
                end: input.end.toISOString(),
            }),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de modifier la réservation"));
    }

    return res.json;
}

async function deleteRoomReservation(officeId: number, reservationId: number) {
    const res = await fetchBackendJson<RoomReservationDeleteResponse, ApiError>(
        `/offices/${officeId}/reservations/${reservationId}`,
        "DELETE",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer la réservation"));
    }

    return res.json;
}

type ClockLike = {
    now: (opts?: { baseDate?: Date }) => Date;
};

export function useCreateRoomReservationMutation(opts: {
    officeId: number;
    dayIso: string;
    clock?: ClockLike;
    me: Pick<IUserData, "id" | "username">;
}) {
    const queryClient = useQueryClient();
    const queryKey = queryKeys.roomReservations(opts.officeId, opts.dayIso);

    return useMutation({
        mutationFn: (input: CreateRoomReservationInput) =>
            createRoomReservation(opts.officeId, input),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<ApiRoomReservationWithUser[]>(queryKey);
            const nowIso = (opts.clock?.now() ?? new Date()).toISOString();
            const optimisticId = -Date.now();

            const optimisticReservation: ApiRoomReservationWithUser = {
                id: optimisticId,
                createdAt: nowIso,
                updatedAt: nowIso,
                officeRoomId: input.officeRoomId,
                title: null,
                titleComputed: opts.me.username,
                start: input.start.toISOString(),
                end: input.end.toISOString(),
                userId: opts.me.id,
            };

            queryClient.setQueryData<ApiRoomReservationWithUser[]>(queryKey, (old = []) => [
                ...old,
                optimisticReservation,
            ]);

            return { previous, optimisticId };
        },
        onError: (_error, _input, context) => {
            if (!context?.previous) return;
            queryClient.setQueryData(queryKey, context.previous);
        },
        onSuccess: (data, _input, context) => {
            queryClient.setQueryData<ApiRoomReservationWithUser[]>(queryKey, (old = []) => {
                const optimisticId = context?.optimisticId;

                const next = old.filter((r) => {
                    if (r.id === optimisticId) return false;
                    return r.id !== data.reservation.id;
                });

                next.push(data.reservation);
                next.sort((a, b) => {
                    if (a.start === b.start) return a.id - b.id;
                    return a.start < b.start ? -1 : 1;
                });

                return next;
            });
        },
    });
}

export function useUpdateRoomReservationMutation(opts: {
    officeId: number;
    dayIso: string;
}) {
    const queryClient = useQueryClient();
    const queryKey = queryKeys.roomReservations(opts.officeId, opts.dayIso);

    return useMutation({
        mutationFn: (input: UpdateRoomReservationInput) =>
            updateRoomReservation(opts.officeId, input),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<ApiRoomReservationWithUser[]>(queryKey);

            queryClient.setQueryData<ApiRoomReservationWithUser[]>(queryKey, (old = []) =>
                old.map((r) =>
                    r.id === input.id
                        ? {
                              ...r,
                              officeRoomId: input.officeRoomId,
                              title: input.title,
                              titleComputed: input.title,
                              start: input.start.toISOString(),
                              end: input.end.toISOString(),
                          }
                        : r,
                ),
            );

            return { previous };
        },
        onError: (_error, _input, context) => {
            if (!context?.previous) return;
            queryClient.setQueryData(queryKey, context.previous);
        },
        onSuccess: (data) => {
            queryClient.setQueryData<ApiRoomReservationWithUser[]>(queryKey, (old = []) =>
                old.map((r) => (r.id === data.reservation.id ? data.reservation : r)),
            );
        },
    });
}

export function useDeleteRoomReservationMutation(opts: {
    officeId: number;
    dayIso: string;
}) {
    const queryClient = useQueryClient();
    const queryKey = queryKeys.roomReservations(opts.officeId, opts.dayIso);

    return useMutation({
        mutationFn: (reservationId: number) => deleteRoomReservation(opts.officeId, reservationId),
        onMutate: async (reservationId) => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<ApiRoomReservationWithUser[]>(queryKey);

            queryClient.setQueryData<ApiRoomReservationWithUser[]>(queryKey, (old = []) =>
                old.filter((r) => r.id !== reservationId),
            );

            return { previous };
        },
        onError: (_error, _input, context) => {
            if (!context?.previous) return;
            queryClient.setQueryData(queryKey, context.previous);
        },
    });
}
