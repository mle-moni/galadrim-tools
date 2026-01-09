import { useEffect, useMemo, useState } from "react";

import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

export function useOfficeFloorSelection(input: {
    offices: ApiOffice[];
    floors: ApiOfficeFloor[];
    rooms: ApiOfficeRoom[];

    meOfficeId?: number | null;
    initialOfficeId?: number;
    initialFloorId?: number;
    focusedRoomId?: number;
}) {
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

    const floorsById = useMemo(() => {
        return new Map(input.floors.map((floor) => [floor.id, floor] as const));
    }, [input.floors]);

    const roomsById = useMemo(() => {
        return new Map(input.rooms.map((room) => [room.id, room] as const));
    }, [input.rooms]);

    useEffect(() => {
        if (input.offices.length === 0) return;

        const hasExplicitOfficeSelection =
            input.focusedRoomId != null || input.initialOfficeId != null;

        if (selectedOfficeId !== null && !hasExplicitOfficeSelection) return;

        const availableOfficeIds = new Set(input.offices.map((o) => o.id));

        let desiredOfficeId: number | null = null;

        if (input.focusedRoomId != null) {
            const room = roomsById.get(input.focusedRoomId);
            const floor = room ? floorsById.get(room.officeFloorId) : undefined;
            const officeIdFromRoom = floor?.officeId;
            if (officeIdFromRoom != null && availableOfficeIds.has(officeIdFromRoom)) {
                desiredOfficeId = officeIdFromRoom;
            }
        }

        if (desiredOfficeId === null && input.initialOfficeId != null) {
            if (availableOfficeIds.has(input.initialOfficeId)) {
                desiredOfficeId = input.initialOfficeId;
            }
        }

        if (desiredOfficeId === null) {
            const officeIdFromMe = input.meOfficeId;
            if (officeIdFromMe != null && availableOfficeIds.has(officeIdFromMe)) {
                desiredOfficeId = officeIdFromMe;
            } else {
                desiredOfficeId = input.offices[0]?.id ?? null;
            }
        }

        if (desiredOfficeId !== null && desiredOfficeId !== selectedOfficeId) {
            setSelectedOfficeId(desiredOfficeId);
        }
    }, [
        floorsById,
        input.focusedRoomId,
        input.initialOfficeId,
        input.meOfficeId,
        input.offices,
        roomsById,
        selectedOfficeId,
    ]);

    useEffect(() => {
        if (selectedOfficeId === null) {
            if (selectedFloorId !== null) setSelectedFloorId(null);
            return;
        }

        const floorsForOffice = input.floors.filter((f) => f.officeId === selectedOfficeId);
        const floorIdsForOffice = new Set(floorsForOffice.map((f) => f.id));

        const hasExplicitFloorSelection =
            input.focusedRoomId != null || input.initialFloorId != null;

        if (!hasExplicitFloorSelection) {
            if (selectedFloorId !== null) setSelectedFloorId(null);
            return;
        }

        let desiredFloorId: number | null = null;

        if (input.focusedRoomId != null) {
            const room = roomsById.get(input.focusedRoomId);
            if (room && floorIdsForOffice.has(room.officeFloorId)) {
                desiredFloorId = room.officeFloorId;
            }
        }

        if (desiredFloorId === null && input.initialFloorId != null) {
            if (floorIdsForOffice.has(input.initialFloorId)) {
                desiredFloorId = input.initialFloorId;
            }
        }

        if (desiredFloorId !== selectedFloorId) {
            setSelectedFloorId(desiredFloorId);
        }
    }, [
        input.floors,
        input.focusedRoomId,
        input.initialFloorId,
        roomsById,
        selectedFloorId,
        selectedOfficeId,
    ]);

    return {
        selectedOfficeId,
        selectedFloorId,
        setSelectedOfficeId,
        setSelectedFloorId,
    } as const;
}
