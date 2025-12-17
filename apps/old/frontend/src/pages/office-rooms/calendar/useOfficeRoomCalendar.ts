import type { ApiRoomReservation } from "@galadrim-tools/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchBackendJson, getErrorMessage } from "../../../api/fetch";
import { notifyError } from "../../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../../idea/createIdea/CreateIdeaStore";
import type { CalendarDateRange, OfficeRoomEvent } from "./OfficeRoomCalendar";

interface ApiRoomReservationMutationResponse {
    message: string;
    reservation: ApiRoomReservation;
}

export const useOfficeRoomCalendar = (officeId: number | null, range: CalendarDateRange) => {
    const reservationsQuery = useQuery({
        enabled: officeId !== null,
        queryKey: ["office-rooms-reservations", officeId, range],
        queryFn: async () => {
            const params = new URLSearchParams();
            range.forEach((date) => {
                params.append("range[]", date.toISOString());
            });
            const res = await fetchBackendJson<ApiRoomReservation[], unknown>(
                `/offices/${officeId}/reservations?${params}`,
            );

            if (!res.ok) {
                throw new Error("Impossible de récupérer les réservations");
            }

            return res.json;
        },
    });

    const createReservationMutation = useMutation({
        mutationFn: async (data: {
            start: Date;
            end: Date;
            officeRoomId: number;
        }) => {
            const res = await fetchBackendJson<ApiRoomReservationMutationResponse, unknown>(
                `/offices/${officeId}/reservations`,
                "POST",
                {
                    body: JSON.stringify(data),
                    headers: APPLICATION_JSON_HEADERS,
                },
            );

            if (!res.ok) {
                notifyError(getErrorMessage(res.json, "Impossible de créer la réservation"));
                throw new Error("Impossible de créer la réservation");
            }

            return res.json;
        },
    });

    const deleteReservationMutation = useMutation({
        mutationFn: async (reservationId: number) => {
            const res = await fetchBackendJson<ApiRoomReservationMutationResponse, unknown>(
                `/offices/${officeId}/reservations/${reservationId}`,
                "DELETE",
            );

            if (!res.ok) {
                notifyError(getErrorMessage(res.json, "Impossible de supprimer la réservation"));
                throw new Error("Impossible de supprimer la réservation");
            }

            return res.json;
        },
    });

    const updateReservationMutation = useMutation({
        mutationFn: async (data: {
            event: OfficeRoomEvent;
            start: Date | string;
            end: Date | string;
            resourceId?: number;
        }) => {
            const dto = {
                officeRoomId: data.resourceId ?? data.event.officeRoomId,
                title: data.event.title,
                start: new Date(data.start).toISOString(),
                end: new Date(data.end).toISOString(),
            };
            const res = await fetchBackendJson<ApiRoomReservationMutationResponse, unknown>(
                `/offices/${officeId}/reservations/${data.event.id}`,
                "PUT",
                {
                    body: JSON.stringify(dto),
                    headers: APPLICATION_JSON_HEADERS,
                },
            );

            if (!res.ok) {
                notifyError(getErrorMessage(res.json, "Impossible de modifier la réservation"));
                throw new Error("Impossible de modifier la réservation");
            }

            return res.json;
        },
    });

    return {
        reservationsQuery,
        createReservationMutation,
        deleteReservationMutation,
        updateReservationMutation,
    };
};
