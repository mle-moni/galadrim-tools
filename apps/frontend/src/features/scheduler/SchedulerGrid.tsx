import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useClock, useNow } from "@/debug/clock";
import { cn } from "@/lib/utils";

import { END_HOUR, HOURS_COUNT, START_HOUR, TIME_COLUMN_WIDTH } from "./constants";
import type { DragSelection, Reservation, Room } from "./types";
import {
    calculateEventLayout,
    getPixelsFromTime,
    getTimeFromPixels,
    roundToNearestMinutes,
} from "./utils";
import SchedulerRoomColumn from "./SchedulerRoomColumn";
import SchedulerTimeColumn from "./SchedulerTimeColumn";

const HEADER_HEIGHT = 40;
const DEFAULT_PIXELS_PER_HOUR = 80;

const MS_PER_MINUTE = 60_000;
const SELECTION_ACTIVATE_DELAY_MS = 100;

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

interface MovingState {
    originalReservation: Reservation;
    currentReservation: Reservation;
    clickTimeOffsetMinutes: number;
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
    const dragActivateTimeoutRef = useRef<number | null>(null);
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

    const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
    const [movingState, setMovingState] = useState<MovingState | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);

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

    const intervalMinutes = isFiveMinuteSlots ? 5 : 15;

    const handleWheel = (e: React.WheelEvent) => {
        const container = containerRef.current;
        if (!container) return;

        if (!e.ctrlKey) return;

        e.preventDefault();

        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        container.scrollLeft += delta;
    };

    const handleSelectionMove = (e: React.MouseEvent) => {
        if (!dragSelection) return;

        const gridContent = getRoomColumnElement(dragSelection.roomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const safeOffsetY = Math.min(Math.max(0, offsetY), gridHeight);

        const rawTime = getTimeFromPixels(safeOffsetY, currentDate, pixelsPerHour);
        let snappedTime = roundToNearestMinutes(rawTime, intervalMinutes);

        const maxDate = new Date(currentDate);
        maxDate.setHours(END_HOUR, 0, 0, 0);
        if (snappedTime > maxDate) snappedTime = maxDate;

        setDragSelection((prev) => (prev ? { ...prev, endTime: snappedTime } : null));
    };

    const handleEventMove = (e: React.MouseEvent) => {
        if (!movingState || !hoveredRoomId) return;

        const gridContent = getRoomColumnElement(hoveredRoomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const mouseTime = getTimeFromPixels(offsetY, currentDate, pixelsPerHour);
        const mouseTimeMinutes = mouseTime.getHours() * 60 + mouseTime.getMinutes();

        let newStartMinutes = mouseTimeMinutes - movingState.clickTimeOffsetMinutes;
        newStartMinutes = Math.round(newStartMinutes / intervalMinutes) * intervalMinutes;

        const minMinutes = START_HOUR * 60;
        const maxMinutes = END_HOUR * 60;
        const durationMinutes =
            (movingState.originalReservation.endTime.getTime() -
                movingState.originalReservation.startTime.getTime()) /
            MS_PER_MINUTE;

        if (newStartMinutes < minMinutes) newStartMinutes = minMinutes;
        if (newStartMinutes + durationMinutes > maxMinutes) {
            newStartMinutes = maxMinutes - durationMinutes;
        }

        const newStart = new Date(currentDate);
        newStart.setHours(Math.floor(newStartMinutes / 60), newStartMinutes % 60, 0, 0);

        const newEnd = new Date(newStart.getTime() + durationMinutes * MS_PER_MINUTE);

        setMovingState((prev) =>
            prev
                ? {
                      ...prev,
                      currentReservation: {
                          ...prev.currentReservation,
                          startTime: newStart,
                          endTime: newEnd,
                          roomId: hoveredRoomId,
                      },
                  }
                : null,
        );
    };

    const handleGlobalMouseMove = (e: React.MouseEvent) => {
        if (dragSelection?.isDragging) {
            handleSelectionMove(e);
            return;
        }

        if (movingState) {
            handleEventMove(e);
        }
    };

    const handleMouseDownOnGrid = (e: React.MouseEvent, roomId: number) => {
        if (e.button !== 0) return;

        setSelectedEventId(null);

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const startTime = getTimeFromPixels(offsetY, currentDate, pixelsPerHour);
        const snappedStart = roundToNearestMinutes(startTime, intervalMinutes);

        const endOfDay = new Date(currentDate);
        endOfDay.setHours(END_HOUR, 0, 0, 0);

        if (snappedStart >= endOfDay) return;

        const snappedEnd = new Date(
            Math.min(snappedStart.getTime() + intervalMinutes * MS_PER_MINUTE, endOfDay.getTime()),
        );

        if (dragActivateTimeoutRef.current !== null) {
            window.clearTimeout(dragActivateTimeoutRef.current);
            dragActivateTimeoutRef.current = null;
        }

        setDragSelection({
            roomId,
            startTime: snappedStart,
            endTime: snappedEnd,
            isDragging: true,
            isActive: false,
        });

        dragActivateTimeoutRef.current = window.setTimeout(() => {
            setDragSelection((prev) => {
                if (!prev?.isDragging) return prev;
                if (prev.roomId !== roomId) return prev;
                return { ...prev, isActive: true };
            });
            dragActivateTimeoutRef.current = null;
        }, SELECTION_ACTIVATE_DELAY_MS);
    };

    const handleDragStartEvent = (e: React.MouseEvent, event: Reservation) => {
        if (!event.canEdit) return;

        const gridContent = getRoomColumnElement(event.roomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickTime = getTimeFromPixels(clickY, currentDate, pixelsPerHour);

        const clickMinutes = clickTime.getHours() * 60 + clickTime.getMinutes();
        const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();

        setMovingState({
            originalReservation: event,
            currentReservation: { ...event },
            clickTimeOffsetMinutes: clickMinutes - startMinutes,
        });

        setHoveredRoomId(event.roomId);
    };

    const handleMouseUp = () => {
        if (dragActivateTimeoutRef.current !== null) {
            window.clearTimeout(dragActivateTimeoutRef.current);
            dragActivateTimeoutRef.current = null;
        }

        if (dragSelection?.isDragging) {
            if (!dragSelection.isActive) {
                setDragSelection(null);
            } else {
                const selectionStart =
                    dragSelection.endTime < dragSelection.startTime
                        ? dragSelection.endTime
                        : dragSelection.startTime;
                const selectionEnd =
                    dragSelection.endTime < dragSelection.startTime
                        ? dragSelection.startTime
                        : dragSelection.endTime;

                const endOfDay = new Date(currentDate);
                endOfDay.setHours(END_HOUR, 0, 0, 0);

                if (selectionStart >= endOfDay) {
                    setDragSelection(null);
                    return;
                }

                const rawEndTime =
                    selectionEnd.getTime() === selectionStart.getTime()
                        ? new Date(selectionStart.getTime() + intervalMinutes * MS_PER_MINUTE)
                        : selectionEnd;

                const endTime = rawEndTime > endOfDay ? endOfDay : rawEndTime;

                if (endTime <= selectionStart) {
                    setDragSelection(null);
                    return;
                }

                onAddReservation({
                    roomId: dragSelection.roomId,
                    startTime: selectionStart,
                    endTime,
                });

                setDragSelection(null);
            }
        } else {
            setDragSelection(null);
        }

        if (movingState) {
            onUpdateReservation(movingState.currentReservation);
            setMovingState(null);
        }
    };

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
    }, [movingState, pixelsPerHour, reservationsByRoomId, rooms]);

    const isToday =
        currentTime.getDate() === currentDate.getDate() &&
        currentTime.getMonth() === currentDate.getMonth() &&
        currentTime.getFullYear() === currentDate.getFullYear();

    const currentLineTop = isToday ? getPixelsFromTime(currentTime, pixelsPerHour) : -1;
    const showCurrentLine = isToday && currentLineTop >= 0 && currentLineTop <= gridHeight;

    return (
        <div
            className="relative flex min-h-0 flex-1 min-w-0 select-none overflow-hidden"
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className="min-h-0 min-w-0 flex-1 overflow-auto bg-background"
                ref={containerRef}
                onWheel={handleWheel}
            >
                <div className="min-w-max">
                    <div className="sticky top-0 z-[75] flex">
                        <div
                            className="sticky left-0 z-[80] flex h-10 flex-shrink-0 items-center justify-center border-b border-r bg-background shadow-sm"
                            style={{ width: TIME_COLUMN_WIDTH }}
                        >
                            <span className="text-sm font-semibold text-muted-foreground">
                                Heure
                            </span>
                        </div>

                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                id={`room-header-${room.id}`}
                                ref={(el) => {
                                    effectiveRoomHeaderRefs.current.set(room.id, el);
                                }}
                                className={cn(
                                    "flex h-10 w-52 flex-shrink-0 items-center justify-center border-b border-r bg-muted/30 text-sm font-semibold text-foreground shadow-sm",
                                    focusedRoomId === room.id && "bg-accent/30",
                                )}
                                onMouseEnter={() => setHoveredRoomId(room.id)}
                            >
                                <span className="truncate px-2" title={room.name}>
                                    {room.name}
                                </span>
                            </div>
                        ))}
                    </div>

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
                                    selectedEventId={selectedEventId}
                                    onSelectEventId={setSelectedEventId}
                                    onDeleteReservation={onDeleteReservation}
                                    onDragStartEvent={handleDragStartEvent}
                                    onMouseEnter={() => setHoveredRoomId(room.id)}
                                    onMouseDown={(e) => handleMouseDownOnGrid(e, room.id)}
                                    setRoomColumnRef={(el) => {
                                        effectiveRoomColumnRefs.current.set(room.id, el);
                                    }}
                                    dragSelection={dragSelection}
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
