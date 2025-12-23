import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, Map as MapIcon } from "lucide-react";
import { io } from "socket.io-client";

import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

import { useClock } from "@/debug/clock";

import FloorTabSelector from "@/components/FloorTabSelector";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

import SchedulerGrid from "./SchedulerGrid";
import SchedulerHeader from "./SchedulerHeader";
import { END_HOUR, START_HOUR, THEME_ME, THEME_OTHER } from "./constants";
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

function formatFloorLabel(floor: number) {
    if (floor === 1) return "1er étage";
    return `${floor}ème étage`;
}

export default function SchedulerPage(props: {
    initialOfficeId?: number;
    initialFloorId?: number;
    focusedRoomId?: number;
}) {
    const clock = useClock();

    const [currentDate, setCurrentDate] = useState<Date>(() => clock.now());
    const [isFiveMinuteSlots, setIsFiveMinuteSlots] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

    const queryClient = useQueryClient();

    const meQuery = useQuery(meQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());
    const officeFloorsQuery = useQuery(officeFloorsQueryOptions());
    const officeRoomsQuery = useQuery(officeRoomsQueryOptions());

    useEffect(() => {
        if (!officesQuery.data) return;

        const hasExplicitOfficeSelection =
            typeof props.focusedRoomId === "number" || typeof props.initialOfficeId === "number";
        if (selectedOfficeId !== null && !hasExplicitOfficeSelection) return;

        const availableOfficeIds = new Set(officesQuery.data.map((o) => o.id));
        const floorsById = new Map((officeFloorsQuery.data ?? []).map((f) => [f.id, f]));
        const roomsById = new Map((officeRoomsQuery.data ?? []).map((r) => [r.id, r]));

        let desiredOfficeId: number | null = null;

        if (typeof props.focusedRoomId === "number") {
            const room = roomsById.get(props.focusedRoomId);
            const floor = room ? floorsById.get(room.officeFloorId) : undefined;
            const officeIdFromRoom = floor?.officeId;
            if (typeof officeIdFromRoom === "number" && availableOfficeIds.has(officeIdFromRoom)) {
                desiredOfficeId = officeIdFromRoom;
            }
        }

        if (desiredOfficeId === null && typeof props.initialOfficeId === "number") {
            if (availableOfficeIds.has(props.initialOfficeId)) {
                desiredOfficeId = props.initialOfficeId;
            }
        }

        if (desiredOfficeId === null) {
            const officeIdFromMe = meQuery.data?.officeId;
            if (typeof officeIdFromMe === "number" && availableOfficeIds.has(officeIdFromMe)) {
                desiredOfficeId = officeIdFromMe;
            } else {
                desiredOfficeId = officesQuery.data[0]?.id ?? null;
            }
        }

        if (desiredOfficeId !== null && desiredOfficeId !== selectedOfficeId) {
            setSelectedOfficeId(desiredOfficeId);
        }
    }, [
        meQuery.data?.officeId,
        officeFloorsQuery.data,
        officeRoomsQuery.data,
        officesQuery.data,
        props.focusedRoomId,
        props.initialOfficeId,
        selectedOfficeId,
    ]);

    useEffect(() => {
        if (selectedOfficeId === null) {
            setSelectedFloorId(null);
            return;
        }

        const floorsForOffice = (officeFloorsQuery.data ?? []).filter(
            (f) => f.officeId === selectedOfficeId,
        );
        const floorIdsForOffice = new Set(floorsForOffice.map((f) => f.id));

        const hasExplicitFloorSelection =
            typeof props.focusedRoomId === "number" || typeof props.initialFloorId === "number";

        if (!hasExplicitFloorSelection) {
            if (selectedFloorId !== null) {
                setSelectedFloorId(null);
            }
            return;
        }

        let desiredFloorId: number | null = null;

        if (typeof props.focusedRoomId === "number") {
            const room = (officeRoomsQuery.data ?? []).find((r) => r.id === props.focusedRoomId);
            if (room && floorIdsForOffice.has(room.officeFloorId)) {
                desiredFloorId = room.officeFloorId;
            }
        }

        if (desiredFloorId === null && typeof props.initialFloorId === "number") {
            if (floorIdsForOffice.has(props.initialFloorId)) {
                desiredFloorId = props.initialFloorId;
            }
        }

        if (desiredFloorId !== selectedFloorId) {
            setSelectedFloorId(desiredFloorId);
        }
    }, [
        officeFloorsQuery.data,
        officeRoomsQuery.data,
        props.focusedRoomId,
        props.initialFloorId,
        selectedFloorId,
        selectedOfficeId,
    ]);

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
        clock,
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

    const officeFloorsForOffice = useMemo(() => {
        if (selectedOfficeId === null) return [];
        return (officeFloorsQuery.data ?? [])
            .filter((f) => f.officeId === selectedOfficeId)
            .slice()
            .sort((a, b) => a.floor - b.floor);
    }, [officeFloorsQuery.data, selectedOfficeId]);

    const floorTabs: { id: number | null; label: string; floor: number | null }[] = useMemo(() => {
        const base: { id: number | null; label: string; floor: number | null }[] = [
            { id: null, label: "Tous", floor: null },
        ];
        for (const floor of officeFloorsForOffice) {
            base.push({
                id: floor.id,
                label: formatFloorLabel(floor.floor),
                floor: floor.floor,
            });
        }
        return base;
    }, [officeFloorsForOffice]);

    const planningSearch = useMemo(() => {
        return {
            officeId: selectedOfficeId ?? undefined,
            floorId: selectedFloorId ?? undefined,
            roomId: props.focusedRoomId ?? undefined,
        };
    }, [props.focusedRoomId, selectedFloorId, selectedOfficeId]);

    const visuelSearch = useMemo(() => {
        return {
            officeId: selectedOfficeId ?? undefined,
            floorId: selectedFloorId ?? undefined,
        };
    }, [selectedFloorId, selectedOfficeId]);

    const rooms: Room[] = useMemo(() => {
        if (selectedOfficeId === null) return [];

        const officeFloorIds = new Set(
            (officeFloorsQuery.data ?? [])
                .filter((floor) => floor.officeId === selectedOfficeId)
                .filter((floor) => (selectedFloorId === null ? true : floor.id === selectedFloorId))
                .map((floor) => floor.id),
        );

        return (officeRoomsQuery.data ?? [])
            .filter(
                (room) =>
                    officeFloorIds.has(room.officeFloorId) && room.isBookable && !room.isPhonebox,
            )
            .map((room) => ({ id: room.id, name: room.name }));
    }, [officeFloorsQuery.data, officeRoomsQuery.data, selectedFloorId, selectedOfficeId]);

    const meId = meQuery.data?.id ?? null;
    const myRights = meQuery.data?.rights ?? 0;

    const reservations: Reservation[] = useMemo(() => {
        const isEventAdmin = (myRights & 0b10) !== 0;

        const scheduleStart = new Date(currentDate);
        scheduleStart.setHours(START_HOUR, 0, 0, 0);

        const scheduleEnd = new Date(currentDate);
        scheduleEnd.setHours(END_HOUR, 0, 0, 0);

        return (reservationsQuery.data ?? [])
            .map((reservation) => {
                const isMine = meId !== null && reservation.userId === meId;

                const startTime = new Date(reservation.start);
                const endTime = new Date(reservation.end);

                if (endTime <= scheduleStart) return null;
                if (startTime >= scheduleEnd) return null;

                const clampedStartTime = startTime < scheduleStart ? scheduleStart : startTime;
                const clampedEndTime = endTime > scheduleEnd ? scheduleEnd : endTime;

                if (clampedEndTime <= clampedStartTime) return null;

                return {
                    id: reservation.id,
                    roomId: reservation.officeRoomId,
                    title: reservation.title ?? "",
                    owner: reservation.titleComputed,
                    startTime: clampedStartTime,
                    endTime: clampedEndTime,
                    color: isMine ? THEME_ME : THEME_OTHER,
                    canEdit: isMine || isEventAdmin,
                };
            })
            .filter((value) => value !== null);
    }, [currentDate, meId, myRights, reservationsQuery.data]);

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

        const scheduleEnd = new Date(currentDate);
        scheduleEnd.setHours(END_HOUR, 0, 0, 0);

        if (input.startTime >= scheduleEnd) return;

        const clampedEnd = input.endTime > scheduleEnd ? scheduleEnd : input.endTime;
        if (clampedEnd <= input.startTime) return;

        createReservationMutation.mutate({
            officeRoomId: input.roomId,
            start: input.startTime,
            end: clampedEnd,
        });
    };

    const handleUpdateReservation = (updatedReservation: Reservation) => {
        if (!selectedOfficeId) return;

        const scheduleEnd = new Date(currentDate);
        scheduleEnd.setHours(END_HOUR, 0, 0, 0);

        if (updatedReservation.startTime >= scheduleEnd) return;

        const clampedEnd =
            updatedReservation.endTime > scheduleEnd ? scheduleEnd : updatedReservation.endTime;
        if (clampedEnd <= updatedReservation.startTime) return;

        updateReservationMutation.mutate({
            id: updatedReservation.id,
            officeRoomId: updatedReservation.roomId,
            start: updatedReservation.startTime,
            end: clampedEnd,
            title: updatedReservation.title || updatedReservation.owner,
        });
    };

    const handleDeleteReservation = (id: number) => {
        if (!selectedOfficeId) return;
        deleteReservationMutation.mutate(id);
    };

    const viewToggle = (
        <div className="flex items-center rounded-md border bg-card p-1">
            <Button asChild size="sm" variant="secondary" className="h-8">
                <Link to="/planning" search={planningSearch}>
                    <CalendarDays className="h-4 w-4" />
                    Planning
                </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-8">
                <Link to="/visuel" search={visuelSearch}>
                    <MapIcon className="h-4 w-4" />
                    Visuel
                </Link>
            </Button>
        </div>
    );

    const officeSelector = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" type="button">
                    <Building2 className="h-4 w-4" />
                    {selectedOfficeName ?? "Chargement…"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {(officesQuery.data ?? []).map((office: ApiOffice) => (
                    <DropdownMenuItem key={office.id} asChild>
                        <Link
                            to="/planning"
                            search={{
                                officeId: office.id,
                                floorId: undefined,
                                roomId: undefined,
                            }}
                        >
                            {office.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const floorFilters = (
        <FloorTabSelector
            tabs={floorTabs}
            selectedId={selectedFloorId}
            to="/planning"
            getSearch={(tabId) => ({
                officeId: selectedOfficeId ?? undefined,
                floorId: tabId ?? undefined,
                roomId: undefined,
            })}
        />
    );

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
                viewToggle={viewToggle}
                officeSelector={officeSelector}
                floorFilters={floorFilters}
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
                        focusedRoomId={props.focusedRoomId}
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
