import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { CalendarDays, Map as MapIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchedulerGrid from "./SchedulerGrid";
import SchedulerHeader from "./SchedulerHeader";
import { getBusyRoomIdsAt } from "./availability";
import {
    END_HOUR,
    START_HOUR,
    THEME_ENTRETIEN_FINAL,
    THEME_ME,
    THEME_MILESTONE,
    THEME_OTHER,
    THEME_PERSON_SEARCH_MATCH,
} from "./constants";
import { useSchedulerSocketSync } from "./use-scheduler-socket-sync";
import { includesEntretienFinal, isIdMultipleOf } from "./utils";
import type { Reservation, Room } from "./types";
import type { ApiRoomReservationWithUser } from "@/integrations/backend/reservations";
import { useClock } from "@/debug/clock";

import { useOfficeFloorSelection } from "@/hooks/use-office-floor-selection";

import FloorTabSelector from "@/components/FloorTabSelector";
import OfficePicker from "@/components/OfficePicker";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { normalizeSearchText } from "@/lib/search";

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
import SearchOverlay from "@/components/SearchOverlay";

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
    const [showOnlyFreeRooms, setShowOnlyFreeRooms] = useState(false);

    const [personSearchOpen, setPersonSearchOpen] = useState(false);
    const [personSearch, setPersonSearch] = useState("");

    const normalizedPersonSearch = useMemo(() => normalizeSearchText(personSearch), [personSearch]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return;
            if (e.key.toLowerCase() !== "f") return;
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.altKey) return;

            e.preventDefault();
            setPersonSearchOpen(true);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

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

    const floorTabs: Array<{ id: number | null; label: string; floor: number | null }> =
        useMemo(() => {
            const base: Array<{ id: number | null; label: string; floor: number | null }> = [
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

    const rooms: Array<Room> = useMemo(() => {
        if (selectedOfficeId === null) return [];

        const officeFloorIds = new Set(
            (officeFloorsQuery.data ?? [])
                .filter((floor) => floor.officeId === selectedOfficeId)
                .filter((floor) => (selectedFloorId === null ? true : floor.id === selectedFloorId))
                .map((floor) => floor.id),
        );

        const floorMap = new Map(
            (officeFloorsQuery.data ?? [])
                .filter((floor) => floor.officeId === selectedOfficeId)
                .map((floor) => [floor.id, floor.floor] as const),
        );

        return (officeRoomsQuery.data ?? [])
            .filter(
                (room) =>
                    officeFloorIds.has(room.officeFloorId) && room.isBookable && !room.isPhonebox,
            )
            .map((room) => ({
                id: room.id,
                name: room.name,
                floor: floorMap.get(room.officeFloorId) ?? 0,
            }))
            .sort((a, b) => a.floor - b.floor);
    }, [officeFloorsQuery.data, officeRoomsQuery.data, selectedFloorId, selectedOfficeId]);

    const meId = meQuery.data?.id ?? null;
    const myRights = meQuery.data?.rights ?? 0;

    const reservations: Array<Reservation> = useMemo(() => {
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

                const bookedByUsername = reservation.user?.username ?? null;
                const isPersonMatch =
                    normalizedPersonSearch !== "" &&
                    normalizeSearchText(bookedByUsername).includes(normalizedPersonSearch);

                const isFinalInterview = isEntretienFinalReservation(reservation);

                let color = isMine ? THEME_ME : THEME_OTHER;
                if (isFinalInterview) {
                    color = THEME_ENTRETIEN_FINAL;
                } else if (isIdMultipleOf(reservation.id, 1000)) {
                    color = THEME_MILESTONE;
                }

                if (isPersonMatch) {
                    color = THEME_PERSON_SEARCH_MATCH;
                }

                return {
                    id: reservation.id,
                    roomId: reservation.officeRoomId,
                    title: reservation.title ?? "",
                    owner: reservation.titleComputed,
                    bookedByUsername,
                    isPersonMatch,
                    startTime: clampedStartTime,
                    endTime: clampedEndTime,
                    color,
                    canEdit: isMine || isEventAdmin,
                };
            })
            .filter((value): value is Reservation => value !== null);
    }, [currentDate, meId, myRights, normalizedPersonSearch, reservationsQuery.data]);

    const filteredRooms = useMemo(() => {
        if (normalizedPersonSearch === "") return rooms;

        const roomIdsWithMatch = new Set(
            reservations.filter((reservation) => reservation.isPersonMatch).map((r) => r.roomId),
        );
        return rooms.filter((room) => roomIdsWithMatch.has(room.id));
    }, [normalizedPersonSearch, reservations, rooms]);

    const nowForAvailability = useMemo(() => {
        const now = clock.now();
        const at = new Date(currentDate);
        at.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return at;
    }, [clock, currentDate]);

    const visibleRooms = useMemo(() => {
        if (!showOnlyFreeRooms) return filteredRooms;

        const busyRoomIds = getBusyRoomIdsAt(reservationsQuery.data ?? [], nowForAvailability);
        return filteredRooms.filter((room) => !busyRoomIds.has(room.id));
    }, [filteredRooms, nowForAvailability, reservationsQuery.data, showOnlyFreeRooms]);

    const usernamesForDay = useMemo(() => {
        const usernames = new Set<string>();
        for (const reservation of reservationsQuery.data ?? []) {
            if (reservation.user?.username) usernames.add(reservation.user.username);
        }
        return Array.from(usernames).sort((a, b) => a.localeCompare(b));
    }, [reservationsQuery.data]);

    const longestCommonPrefix = useCallback((values: Array<string>) => {
        if (values.length === 0) return "";
        if (values.length === 1) return values[0] ?? "";

        let prefix = values[0] ?? "";
        for (let i = 1; i < values.length; i += 1) {
            const value = values[i] ?? "";
            while (prefix !== "" && !value.startsWith(prefix)) {
                prefix = prefix.slice(0, -1);
            }
        }
        return prefix;
    }, []);

    const completePersonSearch = useCallback(() => {
        const raw = personSearch.trim();
        const needle = normalizeSearchText(raw);
        if (!needle) return;

        const matches = usernamesForDay
            .map((username) => ({ username, normalized: normalizeSearchText(username) }))
            .filter((entry) => entry.normalized.startsWith(needle));

        if (matches.length === 0) return;
        if (matches.length === 1) {
            setPersonSearch(matches[0].username);
            return;
        }

        const commonNormalized = longestCommonPrefix(matches.map((m) => m.normalized));
        if (commonNormalized.length > needle.length) {
            setPersonSearch(commonNormalized);
        }
    }, [longestCommonPrefix, personSearch, usernamesForDay]);

    const effectiveFocusedRoomId = useMemo(() => {
        if (!props.focusedRoomId) return props.focusedRoomId;
        if (visibleRooms.some((room) => room.id === props.focusedRoomId))
            return props.focusedRoomId;
        return undefined;
    }, [props.focusedRoomId, visibleRooms]);

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

    const trimmedPersonSearch = personSearch.trim();
    const hasPersonFilter = normalizedPersonSearch !== "";

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
    const isReservationsLoading = reservationsQuery.isLoading;

    const showNoMatches =
        isReady && hasPersonFilter && !isReservationsLoading && visibleRooms.length === 0;

    const showNoFreeRooms =
        isReady && // office + me loaded
        !hasPersonFilter && // not in person-search mode
        showOnlyFreeRooms && // toggle ON
        !isReservationsLoading && // reservations fetched
        visibleRooms.length === 0; // nothing left to show

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
                showOnlyFreeRooms={showOnlyFreeRooms}
                setShowOnlyFreeRooms={setShowOnlyFreeRooms}
                viewToggle={viewToggle}
                officeSelector={officeSelector}
                floorFilters={floorFilters}
            />

            <main className="flex min-h-0 flex-1 flex-col overflow-hidden" data-snowfall="ignore">
                {reservationsError && (
                    <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive">
                        {reservationsError}
                    </div>
                )}

                {isReady ? (
                    showNoMatches ? (
                        <div className="flex flex-1 items-center justify-center px-6">
                            <div className="max-w-md text-center">
                                <div className="text-sm font-semibold">
                                    Aucune réservation trouvée
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Aucune salle réservée par "{trimmedPersonSearch}" ce jour-là.
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setPersonSearchOpen(true)}
                                    >
                                        Modifier
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setPersonSearch("")}
                                    >
                                        Effacer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : showNoFreeRooms ? (
                        <div className="flex flex-1 items-center justify-center px-6">
                            <div className="max-w-md text-center">
                                <div className="text-sm font-semibold">Aucune salle libre</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Toutes les salles sont réservées à cette heure.
                                </div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowOnlyFreeRooms(false)}
                                    >
                                        Afficher toutes les salles
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <SchedulerGrid
                            currentDate={currentDate}
                            rooms={visibleRooms}
                            reservations={reservations}
                            onAddReservation={handleAddReservation}
                            onUpdateReservation={handleUpdateReservation}
                            onDeleteReservation={handleDeleteReservation}
                            isFiveMinuteSlots={isFiveMinuteSlots}
                            focusedRoomId={effectiveFocusedRoomId}
                            roomColumnRefs={roomColumnRefs}
                            roomHeaderRefs={roomHeaderRefs}
                        />
                    )
                ) : (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        Chargement…
                    </div>
                )}

                <SearchOverlay
                    isOpen={personSearchOpen}
                    onClose={() => setPersonSearchOpen(false)}
                    value={personSearch}
                    onChange={setPersonSearch}
                    onClear={() => setPersonSearch("")}
                    placeholder="Rechercher une personne"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            setPersonSearchOpen(false);
                        } else if (e.key === "Tab" && !e.shiftKey) {
                            e.preventDefault();
                            completePersonSearch();
                        } else if (e.key === "Enter") {
                            setPersonSearchOpen(false);
                        }
                    }}
                />
            </main>
        </div>
    );
}
