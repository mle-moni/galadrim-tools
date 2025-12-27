import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Map as MapIcon } from "lucide-react";

import { useClock } from "@/debug/clock";

import { useOfficeFloorSelection } from "@/hooks/use-office-floor-selection";

import FloorTabSelector from "@/components/FloorTabSelector";
import OfficePicker from "@/components/OfficePicker";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import SchedulerGrid from "./SchedulerGrid";
import SchedulerHeader from "./SchedulerHeader";
import { useSchedulerSocketSync } from "./use-scheduler-socket-sync";
import {
    END_HOUR,
    START_HOUR,
    THEME_ENTRETIEN_FINAL,
    THEME_ME,
    THEME_MILESTONE,
    THEME_OTHER,
} from "./constants";
import type { Reservation, Room } from "./types";
import { includesEntretienFinal, isIdMultipleOf } from "./utils";

import { meQueryOptions } from "@/integrations/backend/auth";
import { startOfDayIso } from "@/integrations/backend/date";
import {
    officeFloorsQueryOptions,
    officeRoomsQueryOptions,
    officesQueryOptions,
} from "@/integrations/backend/offices";
import {
    roomReservationsQueryOptions,
    type ApiRoomReservationWithUser,
    useCreateRoomReservationMutation,
    useDeleteRoomReservationMutation,
    useUpdateRoomReservationMutation,
} from "@/integrations/backend/reservations";

function isEntretienFinalReservation(reservation: ApiRoomReservationWithUser) {
    return (
        includesEntretienFinal(reservation.title) ||
        includesEntretienFinal(reservation.titleComputed) ||
        includesEntretienFinal(reservation.user?.username)
    );
}

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
    const router = useRouter();

    const [currentDate, setCurrentDate] = useState<Date>(() => clock.now());
    const [isFiveMinuteSlots, setIsFiveMinuteSlots] = useState(false);

    const queryClient = useQueryClient();

    const roomColumnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const roomHeaderRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

    const meQuery = useQuery(meQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());
    const officeFloorsQuery = useQuery(officeFloorsQueryOptions());
    const officeRoomsQuery = useQuery(officeRoomsQueryOptions());

    const { selectedOfficeId, selectedFloorId } = useOfficeFloorSelection({
        offices: officesQuery.data ?? [],
        floors: officeFloorsQuery.data ?? [],
        rooms: officeRoomsQuery.data ?? [],
        meOfficeId: meQuery.data?.officeId ?? null,
        initialOfficeId: props.initialOfficeId,
        initialFloorId: props.initialFloorId,
        focusedRoomId: props.focusedRoomId,
    });

    const dayIso = useMemo(() => startOfDayIso(currentDate), [currentDate]);
    const officeIdForQueries = selectedOfficeId;

    const reservationsQuery = useQuery({
        ...roomReservationsQueryOptions(officeIdForQueries, dayIso),
        enabled: officeIdForQueries != null,
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

                const isFinalInterview = isEntretienFinalReservation(reservation);

                let color = isMine ? THEME_ME : THEME_OTHER;
                if (isFinalInterview) {
                    color = THEME_ENTRETIEN_FINAL;
                } else if (isIdMultipleOf(reservation.id, 1000)) {
                    color = THEME_MILESTONE;
                }

                return {
                    id: reservation.id,
                    roomId: reservation.officeRoomId,
                    title: reservation.title ?? "",
                    owner: reservation.titleComputed,
                    startTime: clampedStartTime,
                    endTime: clampedEndTime,
                    color,
                    canEdit: isMine || isEventAdmin,
                };
            })
            .filter((value): value is Reservation => value !== null);
    }, [currentDate, meId, myRights, reservationsQuery.data]);

    const socketUserId = meQuery.data?.id;
    const socketToken = meQuery.data?.socketToken;
    const hasOfficeMaps =
        officeRoomsQuery.data !== undefined && officeFloorsQuery.data !== undefined;

    const getRoomColumnElement = useCallback(
        (officeRoomId: number) => roomColumnRefs.current.get(officeRoomId) ?? null,
        [],
    );

    const handleMilestoneEasterEgg = useCallback(() => {
        router.history.push("/scam/winner/omg");
    }, [router.history]);

    useSchedulerSocketSync({
        enabled: hasOfficeMaps,
        socketUserId,
        socketToken,
        queryClient,
        getRoomColumnElement,
        isFinalInterview: isEntretienFinalReservation,
        onMilestoneEasterEgg: handleMilestoneEasterEgg,
    });

    const handleAddReservation = (input: Pick<Reservation, "roomId" | "startTime" | "endTime">) => {
        if (selectedOfficeId == null || !meQuery.data) return;

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
        if (selectedOfficeId == null) return;

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
        if (selectedOfficeId == null) return;
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
        <OfficePicker
            offices={officesQuery.data ?? []}
            selectedOfficeName={selectedOfficeName}
            onSelectOfficeId={(officeId) => {
                const params = new URLSearchParams();
                params.set("officeId", String(officeId));
                router.history.push(`/planning?${params.toString()}`);
            }}
        />
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
                        roomColumnRefs={roomColumnRefs}
                        roomHeaderRefs={roomHeaderRefs}
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
