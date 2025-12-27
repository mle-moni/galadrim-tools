import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useClock, useNow } from "@/debug/clock";

import { HOURS_COUNT, START_HOUR, TIME_COLUMN_WIDTH } from "./constants";
import type { Reservation, Room } from "./types";
import { calculateEventLayout, getPixelsFromTime } from "./utils";
import SchedulerGridRoomHeaderRow from "./SchedulerGridRoomHeaderRow";
import SchedulerRoomColumn from "./SchedulerRoomColumn";
import SchedulerTimeColumn from "./SchedulerTimeColumn";
import { useSchedulerInteractions } from "./useSchedulerInteractions";

const HEADER_HEIGHT = 40;
const DEFAULT_PIXELS_PER_HOUR = 80;

interface SchedulerGridProps {
    currentDate: Date;
    rooms: Room[];
    reservations: Reservation[];
    onAddReservation: (reservation: Pick<Reservation, "roomId" | "startTime" | "endTime">) => void;
    onUpdateReservation: (reservation: Reservation) => void;
    onDeleteReservation: (id: Reservation["id"]) => void;
    isFiveMinuteSlots: boolean;
    focusedRoomId?: number;
    roomColumnRefs?: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
    roomHeaderRefs?: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
}

export default function SchedulerGrid({
    currentDate,
    rooms,
    reservations,
    onAddReservation,
    onUpdateReservation,
    onDeleteReservation,
    isFiveMinuteSlots,
    focusedRoomId,
    roomColumnRefs,
    roomHeaderRefs,
}: SchedulerGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const autoScrollKeyRef = useRef<string | null>(null);

    const internalRoomColumnRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const internalRoomHeaderRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const effectiveRoomColumnRefs = roomColumnRefs ?? internalRoomColumnRefs;
    const effectiveRoomHeaderRefs = roomHeaderRefs ?? internalRoomHeaderRefs;

    const clock = useClock();
    const currentTime = useNow({ baseDate: currentDate, intervalMs: 60_000 });
    const isSpoofedNow = clock.isSpoofed({ baseDate: currentDate });
    const spoofedNowMs = isSpoofedNow ? currentTime.getTime() : null;

    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const update = () => setContainerHeight(container.clientHeight);
        update();

        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", update);
            return () => window.removeEventListener("resize", update);
        }

        const observer = new ResizeObserver(() => update());
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const pixelsPerHour = useMemo(() => {
        if (!containerHeight) return DEFAULT_PIXELS_PER_HOUR;

        const availableHeight = Math.max(0, containerHeight - HEADER_HEIGHT);
        const fit = availableHeight / HOURS_COUNT;
        return Math.max(DEFAULT_PIXELS_PER_HOUR, fit);
    }, [containerHeight]);

    const gridHeight = HOURS_COUNT * pixelsPerHour;
    const intervalMinutes = isFiveMinuteSlots ? 5 : 15;

    const getRoomHeaderElement = useCallback(
        (roomId: number) => {
            return effectiveRoomHeaderRefs.current.get(roomId) ?? null;
        },
        [effectiveRoomHeaderRefs],
    );

    const getRoomColumnElement = useCallback(
        (roomId: number) => {
            return effectiveRoomColumnRefs.current.get(roomId) ?? null;
        },
        [effectiveRoomColumnRefs],
    );

    useEffect(() => {
        if (!focusedRoomId) return;
        if (!rooms.some((r) => r.id === focusedRoomId)) return;

        const container = containerRef.current;
        if (!container) return;

        const roomHeader = getRoomHeaderElement(focusedRoomId);
        if (!roomHeader) return;

        const containerRect = container.getBoundingClientRect();
        const roomRect = roomHeader.getBoundingClientRect();

        const roomCenterX =
            roomRect.left - containerRect.left + container.scrollLeft + roomRect.width / 2;
        const targetCenterX = (container.clientWidth + TIME_COLUMN_WIDTH) / 2;
        const targetLeft = roomCenterX - targetCenterX;

        container.scrollTo({
            left: Math.max(0, targetLeft),
            top: container.scrollTop,
            behavior: "smooth",
        });
    }, [focusedRoomId, getRoomHeaderElement, rooms]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (!containerHeight) return;

        const autoScrollKey = `${currentDate.toDateString()}-${spoofedNowMs ?? "realtime"}`;
        if (autoScrollKeyRef.current === autoScrollKey) return;
        autoScrollKeyRef.current = autoScrollKey;

        const now = isSpoofedNow ? currentTime : new Date();
        const isToday =
            now.getDate() === currentDate.getDate() &&
            now.getMonth() === currentDate.getMonth() &&
            now.getFullYear() === currentDate.getFullYear();

        if (!isToday) return;

        const rawCurrentLineTop = getPixelsFromTime(now, pixelsPerHour);
        const currentLineTop = Math.min(Math.max(rawCurrentLineTop, 0), gridHeight);
        const targetTop = currentLineTop - (container.clientHeight - HEADER_HEIGHT) / 2;

        requestAnimationFrame(() => {
            container.scrollTo({
                top: Math.max(0, targetTop),
                left: container.scrollLeft,
                behavior: "smooth",
            });
        });
    }, [
        containerHeight,
        currentDate,
        currentTime,
        gridHeight,
        isSpoofedNow,
        pixelsPerHour,
        spoofedNowMs,
    ]);

    const handleWheel = (e: React.WheelEvent) => {
        const container = containerRef.current;
        if (!container) return;

        if (!e.ctrlKey) return;

        e.preventDefault();

        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta;
    };

    const interactions = useSchedulerInteractions({
        currentDate,
        pixelsPerHour,
        gridHeight,
        intervalMinutes,
        getRoomColumnElement,
        onAddReservation,
        onUpdateReservation,
    });

    const hourIntervals = Array.from({ length: HOURS_COUNT }, (_, i) => START_HOUR + i);

    const currentHour = currentTime.getHours();
    const focusStart = currentHour - 1;
    const focusEnd = currentHour + 1;

    const shouldShowHalfHour = (hour: number) => {
        return hour >= focusStart && hour <= focusEnd;
    };

    const reservationsByRoomId = useMemo(() => {
        const map = new Map<number, Reservation[]>();
        for (const reservation of reservations) {
            const existing = map.get(reservation.roomId);
            if (existing) existing.push(reservation);
            else map.set(reservation.roomId, [reservation]);
        }
        return map;
    }, [reservations]);

    const roomEventsByRoomId = useMemo(() => {
        const map = new Map<number, ReturnType<typeof calculateEventLayout>>();
        const movingState = interactions.movingState;

        for (const room of rooms) {
            const base = reservationsByRoomId.get(room.id) ?? [];
            let roomReservations = base;

            if (movingState) {
                roomReservations = roomReservations.filter(
                    (r) => r.id !== movingState.originalReservation.id,
                );

                if (movingState.currentReservation.roomId === room.id) {
                    roomReservations = [...roomReservations, movingState.currentReservation];
                }
            }

            map.set(room.id, calculateEventLayout(roomReservations, pixelsPerHour));
        }

        return map;
    }, [interactions.movingState, pixelsPerHour, reservationsByRoomId, rooms]);

    const isToday =
        currentTime.getDate() === currentDate.getDate() &&
        currentTime.getMonth() === currentDate.getMonth() &&
        currentTime.getFullYear() === currentDate.getFullYear();

    const currentLineTop = isToday ? getPixelsFromTime(currentTime, pixelsPerHour) : -1;
    const showCurrentLine = isToday && currentLineTop >= 0 && currentLineTop <= gridHeight;

    return (
        <div
            className="relative flex min-h-0 flex-1 min-w-0 select-none overflow-hidden"
            onMouseMove={interactions.handleGlobalMouseMove}
            onMouseUp={interactions.handleMouseUp}
            onMouseLeave={interactions.handleMouseUp}
        >
            <div
                className="min-h-0 min-w-0 flex-1 overflow-auto bg-background"
                ref={containerRef}
                onWheel={handleWheel}
            >
                <div className="min-w-max">
                    <SchedulerGridRoomHeaderRow
                        rooms={rooms}
                        focusedRoomId={focusedRoomId}
                        setRoomHeaderRef={(roomId, el) => {
                            effectiveRoomHeaderRefs.current.set(roomId, el);
                        }}
                        onRoomHover={(roomId) => interactions.setHoveredRoomId(roomId)}
                    />

                    <div className="flex">
                        <div
                            className="sticky left-0 z-[70] flex flex-shrink-0 flex-col border-r bg-background shadow-sm"
                            style={{ width: TIME_COLUMN_WIDTH }}
                        >
                            <SchedulerTimeColumn
                                hourIntervals={hourIntervals}
                                pixelsPerHour={pixelsPerHour}
                                gridHeight={gridHeight}
                                shouldShowHalfHour={shouldShowHalfHour}
                                showCurrentLine={showCurrentLine}
                                currentLineTop={currentLineTop}
                                currentTime={currentTime}
                            />
                        </div>

                        <div className="flex min-w-max">
                            {rooms.map((room) => (
                                <SchedulerRoomColumn
                                    key={room.id}
                                    room={room}
                                    focusedRoomId={focusedRoomId}
                                    gridHeight={gridHeight}
                                    pixelsPerHour={pixelsPerHour}
                                    hourIntervals={hourIntervals}
                                    events={roomEventsByRoomId.get(room.id) ?? []}
                                    selectedEventId={interactions.selectedEventId}
                                    onSelectEventId={interactions.setSelectedEventId}
                                    onDeleteReservation={onDeleteReservation}
                                    onDragStartEvent={interactions.handleDragStartEvent}
                                    onMouseEnter={() => interactions.setHoveredRoomId(room.id)}
                                    onMouseDown={(e) =>
                                        interactions.handleMouseDownOnGrid(e, room.id)
                                    }
                                    setRoomColumnRef={(el) => {
                                        effectiveRoomColumnRefs.current.set(room.id, el);
                                    }}
                                    dragSelection={interactions.dragSelection}
                                    intervalMinutes={intervalMinutes}
                                    showCurrentLine={showCurrentLine}
                                    currentLineTop={currentLineTop}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
