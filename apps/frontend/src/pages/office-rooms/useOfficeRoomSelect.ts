import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBackendJson } from "../../api/fetch";

const NO_ID = 0;
const NO_ID_OPTION = { label: "Aucun", value: NO_ID };

export const useOfficeRoomSelect = (selectedFloor: ApiOfficeFloor | null) => {
    const navigate = useNavigate();
    const { officeId, officeFloorId, officeRoomId: officeRoomIdRaw } = useParams();
    const officeRoomId = Number(officeRoomIdRaw ?? NO_ID);
    const query = useQuery({
        queryKey: ["office-rooms"],
        queryFn: async () => {
            const res = await fetchBackendJson<{ data: ApiOfficeRoom[] }, unknown>(
                "/adomin/api/models/crud/OfficeRoom?pageIndex=1&pageSize=100",
                "GET",
            );

            if (!res.ok) {
                throw new Error("Impossible de récupérer les salles");
            }

            return res.json;
        },
    });

    const officeRooms = useMemo(() => {
        if (!query.data) return [];

        const officeRooms = query.data.data.filter((o) => o.officeFloorId === selectedFloor?.id);

        return officeRooms;
    }, [query.data, selectedFloor]);

    const options = useMemo(() => {
        if (officeRooms.length === 0) return [NO_ID_OPTION];

        return officeRooms.map((o) => ({
            label: `étage ${selectedFloor?.floor} ${o.name}`,
            value: o.id,
        }));
    }, [officeRooms, selectedFloor]);

    const selected = useMemo(() => {
        if (!query.data) return null;

        return query.data.data.find((o) => o.id === officeRoomId) ?? null;
    }, [query.data, officeRoomId]);

    const setSelected = (newState: ApiOfficeRoom | null) => {
        if (!newState) {
            navigate(`/office-rooms/${officeId}/${officeFloorId}`);
        } else {
            navigate(`/office-rooms/${officeId}/${officeFloorId}/${newState.id}`);
        }
    };

    const setSelectedFromId = (id: number) => {
        const found = query.data?.data.find((o) => o.id === id);
        if (!found) return;
        setSelected(found);
    };

    return {
        officeRooms,
        officeRoomsOptions: options,
        selectedOfficeRoom: selected,
        selectedOfficeRoomId: selected?.id ?? NO_ID,
        setSelectedOfficeRoomFromId: setSelectedFromId,
    };
};
