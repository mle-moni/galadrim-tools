import { useMutation } from "@tanstack/react-query";
import { fetchBackendJson } from "../../../api/fetch";
import { queryClient } from "../../../queryClient";
import { notifySuccess } from "../../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../../idea/createIdea/CreateIdeaStore";

export interface ApiOfficeRoomDto {
    id: number;
    name: string;
    config: string;
    officeFloor: number;
    isBookable: boolean;
    isPhonebox: boolean;
}

export const useOfficeRoomCreateMutation = () => {
    const mutation = useMutation({
        mutationFn: async (data: Omit<ApiOfficeRoomDto, "id">) => {
            const res = await fetchBackendJson("/adomin/api/models/crud/OfficeRoom", "POST", {
                body: JSON.stringify(data),
                headers: APPLICATION_JSON_HEADERS,
            });

            if (!res.ok) {
                throw new Error("Impossible de créer la salle");
            }

            return res.json;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["office-rooms"],
            });
        },
    });

    return mutation;
};

export const useOfficeRoomUpdateMutation = () => {
    const mutation = useMutation({
        mutationFn: async (data: ApiOfficeRoomDto) => {
            const res = await fetchBackendJson(
                `/adomin/api/models/crud/OfficeRoom/${data.id}`,
                "PUT",
                {
                    body: JSON.stringify(data),
                    headers: APPLICATION_JSON_HEADERS,
                },
            );

            if (!res.ok) {
                throw new Error("Impossible de modifier la salle");
            }

            return res.json;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["office-rooms"],
            });
            notifySuccess("Salle modifiée");
        },
    });

    return mutation;
};

export const useOfficeRoomDeleteMutation = (onDelete: () => void) => {
    const mutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetchBackendJson(
                `/adomin/api/models/crud/OfficeRoom/${id}`,
                "DELETE",
                { headers: APPLICATION_JSON_HEADERS },
            );

            if (!res.ok) {
                throw new Error("Impossible de modifier la salle");
            }

            return res.json;
        },
        onSuccess: () => {
            onDelete();
            queryClient.invalidateQueries({
                queryKey: ["office-rooms"],
            });
        },
    });

    return mutation;
};
