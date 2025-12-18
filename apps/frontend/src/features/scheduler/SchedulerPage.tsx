import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SidebarTrigger } from "@/components/ui/sidebar";

import SchedulerGrid from "./SchedulerGrid";
import SchedulerHeader from "./SchedulerHeader";
import { THEME_ME, THEME_OTHER } from "./constants";
import type { Reservation, Room } from "./types";

import { meQueryOptions } from "@/integrations/backend/auth";
import { startOfDayIso } from "@/integrations/backend/date";
import {
    officeFloorsQueryOptions,
    officeRoomsQueryOptions,
    officesQueryOptions,
} from "@/integrations/backend/offices";
import {
    roomReservationsQueryOptions,
    useCreateRoomReservationMutation,
    useDeleteRoomReservationMutation,
    useUpdateRoomReservationMutation,
} from "@/integrations/backend/reservations";

export default function SchedulerPage() {
    const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
    const [isFiveMinuteSlots, setIsFiveMinuteSlots] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

    const meQuery = useQuery(meQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());
    const officeFloorsQuery = useQuery(officeFloorsQueryOptions());
    const officeRoomsQuery = useQuery(officeRoomsQueryOptions());

    useEffect(() => {
        if (selectedOfficeId !== null) return;

        const officeIdFromMe = meQuery.data?.officeId ?? null;
        if (officeIdFromMe !== null) {
            setSelectedOfficeId(officeIdFromMe);
            return;
        }

        const firstOfficeId = officesQuery.data?.[0]?.id ?? null;
        if (firstOfficeId !== null) {
            setSelectedOfficeId(firstOfficeId);
        }
    }, [meQuery.data?.officeId, officesQuery.data, selectedOfficeId]);

    const dayIso = useMemo(() => startOfDayIso(currentDate), [currentDate]);
    const officeIdForQueries = selectedOfficeId ?? 0;

    const reservationsQuery = useQuery({
        ...roomReservationsQueryOptions(officeIdForQueries, dayIso),
        enabled: selectedOfficeId !== null,
    });

    const reservationsError =
        reservationsQuery.error instanceof Error ? reservationsQuery.error.message : null;

    const createReservationMutation = useCreateRoomReservationMutation({
        officeId: officeIdForQueries,
        dayIso,
        me: {
            id: meQuery.data?.id ?? 0,
            username: meQuery.data?.username ?? "Moi",
        },
    });

    const updateReservationMutation = useUpdateRoomReservationMutation({
        officeId: officeIdForQueries,
        dayIso,
    });

    const deleteReservationMutation = useDeleteRoomReservationMutation({
        officeId: officeIdForQueries,
        dayIso,
    });

    const selectedOfficeName = useMemo(() => {
        if (selectedOfficeId === null) return undefined;
        return officesQuery.data?.find((o) => o.id === selectedOfficeId)?.name;
    }, [officesQuery.data, selectedOfficeId]);

    const rooms: Room[] = useMemo(() => {
        if (selectedOfficeId === null) return [];

        const officeFloorIds = new Set(
            (officeFloorsQuery.data ?? [])
                .filter((floor) => floor.officeId === selectedOfficeId)
                .map((floor) => floor.id),
        );

        return (officeRoomsQuery.data ?? [])
            .filter(
                (room) =>
                    officeFloorIds.has(room.officeFloorId) && room.isBookable && !room.isPhonebox,
            )
            .map((room) => ({ id: room.id, name: room.name }));
    }, [officeFloorsQuery.data, officeRoomsQuery.data, selectedOfficeId]);

    const meId = meQuery.data?.id ?? null;
    const myRights = meQuery.data?.rights ?? 0;

    const reservations: Reservation[] = useMemo(() => {
        const isEventAdmin = (myRights & 0b10) !== 0;

        return (reservationsQuery.data ?? []).map((reservation) => {
            const isMine = meId !== null && reservation.userId === meId;

            return {
                id: reservation.id,
                roomId: reservation.officeRoomId,
                title: reservation.title ?? "",
                owner: reservation.titleComputed,
                startTime: new Date(reservation.start),
                endTime: new Date(reservation.end),
                color: isMine ? THEME_ME : THEME_OTHER,
                canEdit: isMine || isEventAdmin,
            };
        });
    }, [meId, myRights, reservationsQuery.data]);

    const handleAddReservation = (input: Pick<Reservation, "roomId" | "startTime" | "endTime">) => {
        if (!selectedOfficeId || !meQuery.data) return;

        createReservationMutation.mutate({
            officeRoomId: input.roomId,
            start: input.startTime,
            end: input.endTime,
        });
    };

    const handleUpdateReservation = (updatedReservation: Reservation) => {
        if (!selectedOfficeId) return;

        updateReservationMutation.mutate({
            id: updatedReservation.id,
            officeRoomId: updatedReservation.roomId,
            start: updatedReservation.startTime,
            end: updatedReservation.endTime,
            title: updatedReservation.title || updatedReservation.owner,
        });
    };

    const handleDeleteReservation = (id: number) => {
        if (!selectedOfficeId) return;
        deleteReservationMutation.mutate(id);
    };

    const isReady = selectedOfficeId !== null && meQuery.data !== undefined;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <SchedulerHeader
                leading={
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                    </div>
                }
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                isFiveMinuteSlots={isFiveMinuteSlots}
                setIsFiveMinuteSlots={setIsFiveMinuteSlots}
                officeName={selectedOfficeName}
            />

            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {reservationsError && (
                    <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive">
                        {reservationsError}
                    </div>
                )}
                {isReady ? (
                    <SchedulerGrid
                        currentDate={currentDate}
                        rooms={rooms}
                        reservations={reservations}
                        onAddReservation={handleAddReservation}
                        onUpdateReservation={handleUpdateReservation}
                        onDeleteReservation={handleDeleteReservation}
                        isFiveMinuteSlots={isFiveMinuteSlots}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        Chargement…
                    </div>
                )}
            </main>
        </div>
    );
}
