import { useEffect } from "react";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";

import type { QueryClient } from "@tanstack/react-query";
import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";

import { parseId } from "@/lib/parse";

import { getSocketApiUrl } from "@/integrations/backend/client";
import { startOfDayIso } from "@/integrations/backend/date";
import { queryKeys } from "@/integrations/backend/query-keys";
import type { ApiRoomReservationWithUser } from "@/integrations/backend/reservations";

import { END_HOUR, START_HOUR } from "./constants";
import { isIdMultipleOf } from "./utils";

function fireConfettiAtReservationTop(
    reservation: ApiRoomReservationWithUser,
    getRoomColumnElement: (officeRoomId: number) => HTMLElement | null,
) {
    const column = getRoomColumnElement(reservation.officeRoomId);
    if (!column) return;

    const rect = column.getBoundingClientRect();
    const height = column.clientHeight || rect.height;
    if (!height) return;

    const startTime = new Date(reservation.start);
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const scheduleStartMinutes = START_HOUR * 60;
    const scheduleEndMinutes = END_HOUR * 60;

    const clampedMinutes = Math.min(
        scheduleEndMinutes,
        Math.max(scheduleStartMinutes, startMinutes),
    );
    const offsetMinutes = clampedMinutes - scheduleStartMinutes;

    const pixelsPerHour = height / (END_HOUR - START_HOUR);
    const topWithinColumn = (offsetMinutes / 60) * pixelsPerHour;

    const rawX = (rect.left + rect.width / 2) / window.innerWidth;
    const rawY = (rect.top + topWithinColumn) / window.innerHeight;

    const x = Math.min(0.98, Math.max(0.02, rawX));
    const y = Math.min(0.98, Math.max(0.02, rawY));

    confetti({
        particleCount: 140,
        spread: 85,
        startVelocity: 45,
        origin: { x, y },
    });

    confetti({
        particleCount: 90,
        spread: 120,
        startVelocity: 55,
        origin: { x: Math.max(0.02, x - 0.08), y: Math.max(0.02, y - 0.1) },
    });

    confetti({
        particleCount: 90,
        spread: 120,
        startVelocity: 55,
        origin: { x: Math.min(0.98, x + 0.08), y: Math.max(0.02, y - 0.1) },
    });
}

export function useSchedulerSocketSync(opts: {
    enabled: boolean;
    socketUserId: number | undefined;
    socketToken: string | undefined;
    queryClient: QueryClient;
    getRoomColumnElement: (officeRoomId: number) => HTMLElement | null;
    isFinalInterview: (reservation: ApiRoomReservationWithUser) => boolean;
    onMilestoneEasterEgg?: () => void;
}) {
    const {
        enabled,
        socketUserId,
        socketToken,
        queryClient,
        getRoomColumnElement,
        isFinalInterview,
        onMilestoneEasterEgg,
    } = opts;

    useEffect(() => {
        if (!enabled) return;
        if (socketUserId == null) return;
        if (!socketToken) return;

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
            opts2: { removeOptimistic?: boolean } = {},
        ) => {
            queryClient.setQueriesData<ApiRoomReservationWithUser[]>(
                { queryKey: roomReservationsRootKey },
                (old) => {
                    if (!old) return old;

                    const reservationStartMs = Date.parse(reservation.start);
                    const reservationEndMs = Date.parse(reservation.end);

                    return old.filter((r) => {
                        if (r.id === reservation.id) return false;

                        if (
                            opts2.removeOptimistic &&
                            r.id < 0 &&
                            r.officeRoomId === reservation.officeRoomId &&
                            r.userId === reservation.userId
                        ) {
                            const rStartMs = Date.parse(r.start);
                            const rEndMs = Date.parse(r.end);

                            const parsedTimesMatch =
                                rStartMs === reservationStartMs && rEndMs === reservationEndMs;

                            const stringTimesMatch =
                                r.start === reservation.start && r.end === reservation.end;

                            if (parsedTimesMatch || stringTimesMatch) return false;
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
                    const reservationStartMs = Date.parse(reservation.start);
                    const reservationEndMs = Date.parse(reservation.end);

                    const next = (old ?? []).filter((r) => {
                        if (r.id === reservation.id) return false;

                        if (
                            opts2.removeOptimistic &&
                            r.id < 0 &&
                            r.officeRoomId === reservation.officeRoomId &&
                            r.userId === reservation.userId
                        ) {
                            const rStartMs = Date.parse(r.start);
                            const rEndMs = Date.parse(r.end);

                            const parsedTimesMatch =
                                rStartMs === reservationStartMs && rEndMs === reservationEndMs;

                            const stringTimesMatch =
                                r.start === reservation.start && r.end === reservation.end;

                            if (parsedTimesMatch || stringTimesMatch) return false;
                        }

                        return true;
                    });

                    next.push(reservation);
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
                socketToken: socketToken,
            });
        };

        socket.on("connect", authenticate);
        socket.on("auth", authenticate);

        const handleCreateRoomReservation = (
            reservation: ApiRoomReservationWithUser,
            opts2: { removeOptimistic?: boolean } = {},
        ) => {
            upsertRoomReservation(reservation, opts2);

            const isFinalInterviewReservation = isFinalInterview(reservation);

            if (!isFinalInterviewReservation && isIdMultipleOf(reservation.id, 1000)) {
                requestAnimationFrame(() => {
                    fireConfettiAtReservationTop(reservation, getRoomColumnElement);
                });
            }

            if (
                !isFinalInterviewReservation &&
                isIdMultipleOf(reservation.id, 10000) &&
                reservation.userId === socketUserId
            ) {
                onMilestoneEasterEgg?.();
            }
        };

        socket.on("createRoomReservation", (reservation: ApiRoomReservationWithUser) =>
            handleCreateRoomReservation(reservation, { removeOptimistic: true }),
        );

        socket.on("updateRoomReservation", (reservation: ApiRoomReservationWithUser) =>
            upsertRoomReservation(reservation),
        );

        socket.on("deleteRoomReservation", (payload: unknown) => {
            const reservationId = parseId(payload);
            if (reservationId == null) return;
            removeRoomReservation(reservationId);
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [
        enabled,
        getRoomColumnElement,
        isFinalInterview,
        onMilestoneEasterEgg,
        queryClient,
        socketToken,
        socketUserId,
    ]);
}
