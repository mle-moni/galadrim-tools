import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

import { SidebarTrigger } from "@/components/ui/sidebar";

import SchedulerGrid from "./SchedulerGrid";
import SchedulerHeader from "./SchedulerHeader";
import { THEME_ME, THEME_OTHER } from "./constants";
import type { Reservation, Room } from "./types";

import { meQueryOptions } from "@/integrations/backend/auth";
import { getSocketApiUrl } from "@/integrations/backend/client";
import { startOfDayIso } from "@/integrations/backend/date";
import {
    officeFloorsQueryOptions,
    officeRoomsQueryOptions,
    officesQueryOptions,
} from "@/integrations/backend/offices";
import { queryKeys } from "@/integrations/backend/query-keys";
import {
    roomReservationsQueryOptions,
    type ApiRoomReservationWithUser,
    useCreateRoomReservationMutation,
    useDeleteRoomReservationMutation,
    useUpdateRoomReservationMutation,
} from "@/integrations/backend/reservations";

export default function SchedulerPage() {
    const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
    const [isFiveMinuteSlots, setIsFiveMinuteSlots] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

    const queryClient = useQueryClient();

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

    const socketUserId = meQuery.data?.id;
    const socketToken = meQuery.data?.socketToken;
    const hasOfficeMaps =
        officeRoomsQuery.data !== undefined && officeFloorsQuery.data !== undefined;

    useEffect(() => {
        if (!hasOfficeMaps) return;
        if (typeof socketUserId !== "number") return;
        if (typeof socketToken !== "string" || socketToken.length === 0) return;

        const socket = io(getSocketApiUrl(), { transports: ["websocket"] });
        const roomReservationsRootKey = ["roomReservations"] as const;

        const getOfficeIdForRoomId = (officeRoomId: number): number | null => {
            const officeRooms = queryClient.getQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms());
            const officeFloors = queryClient.getQueryData<ApiOfficeFloor[]>(
                queryKeys.officeFloors(),
            );
            if (!officeRooms || !officeFloors) return null;

            const room = officeRooms.find((r) => r.id === officeRoomId);
            if (!room) return null;

            const floor = officeFloors.find((f) => f.id === room.officeFloorId);
            return floor?.officeId ?? null;
        };

        const removeRoomReservation = (reservationId: number) => {
            queryClient.setQueriesData<ApiRoomReservationWithUser[]>(
                { queryKey: roomReservationsRootKey },
                (old) => old?.filter((r) => r.id !== reservationId) ?? old,
            );
        };

        const upsertRoomReservation = (
            reservation: ApiRoomReservationWithUser,
            opts: { removeOptimistic?: boolean } = {},
        ) => {
            queryClient.setQueriesData<ApiRoomReservationWithUser[]>(
                { queryKey: roomReservationsRootKey },
                (old) => {
                    if (!old) return old;

                    return old.filter((r) => {
                        if (r.id === reservation.id) return false;
                        if (
                            opts.removeOptimistic &&
                            r.id < 0 &&
                            r.officeRoomId === reservation.officeRoomId &&
                            r.start === reservation.start &&
                            r.end === reservation.end &&
                            r.userId === reservation.userId
                        ) {
                            return false;
                        }
                        return true;
                    });
                },
            );

            const officeId = getOfficeIdForRoomId(reservation.officeRoomId);
            if (officeId === null) return;

            const dayIso = startOfDayIso(new Date(reservation.start));
            const targetQueryKey = queryKeys.roomReservations(officeId, dayIso);

            queryClient.setQueriesData<ApiRoomReservationWithUser[]>(
                { queryKey: targetQueryKey, exact: true },
                (old) => {
                    if (!old) return old;

                    const next = [...old, reservation];
                    next.sort((a, b) => {
                        if (a.start === b.start) return a.id - b.id;
                        return a.start < b.start ? -1 : 1;
                    });
                    return next;
                },
            );
        };

        const authenticate = () => {
            socket.emit("auth", {
                userId: socketUserId,
                socketToken,
            });
        };

        socket.on("connect", authenticate);
        socket.on("auth", authenticate);

        socket.on("createRoomReservation", (reservation: ApiRoomReservationWithUser) =>
            upsertRoomReservation(reservation, { removeOptimistic: true }),
        );
        socket.on("updateRoomReservation", (reservation: ApiRoomReservationWithUser) =>
            upsertRoomReservation(reservation),
        );
        socket.on("deleteRoomReservation", (reservationId: unknown) => {
            const id = typeof reservationId === "number" ? reservationId : Number(reservationId);
            if (!Number.isFinite(id)) return;
            removeRoomReservation(id);
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [hasOfficeMaps, queryClient, socketToken, socketUserId]);

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
