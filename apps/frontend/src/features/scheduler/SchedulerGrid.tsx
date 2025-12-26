import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useClock, useNow } from "@/debug/clock";
import { cn } from "@/lib/utils";

import { END_HOUR, HOURS_COUNT, START_HOUR, TIME_COLUMN_WIDTH } from "./constants";
import type { DragSelection, Reservation, Room } from "./types";
import {
    calculateEventLayout,
    formatTime,
    getPixelsFromTime,
    getTimeFromPixels,
    roundToNearestMinutes,
} from "./utils";
import EventBlock from "./EventBlock";

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
            return (
                roomHeaderRefs?.current.get(roomId) ??
                document.getElementById(`room-header-${roomId}`)
            );
        },
        [roomHeaderRefs],
    );

    const getRoomColumnElement = useCallback(
        (roomId: number) => {
            return (
                roomColumnRefs?.current.get(roomId) ?? document.getElementById(`room-col-${roomId}`)
            );
        },
        [roomColumnRefs],
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

    const getRoomEvents = (roomId: number) => {
        let roomReservations = reservations.filter((r) => r.roomId === roomId);

        if (movingState) {
            roomReservations = roomReservations.filter(
                (r) => r.id !== movingState.originalReservation.id,
            );
            if (movingState.currentReservation.roomId === roomId) {
                roomReservations.push(movingState.currentReservation);
            }
        }

        return calculateEventLayout(roomReservations, pixelsPerHour);
    };

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
                                ref={(el) => roomHeaderRefs?.current.set(room.id, el)}
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
                            <div className="relative" style={{ height: gridHeight }}>
                                {hourIntervals.map((hour) => (
                                    <div
                                        key={hour}
                                        className="relative w-full box-border border-b border-border/50"
                                        style={{ height: pixelsPerHour }}
                                    >
                                        <span className="absolute top-2 left-0 right-0 text-center font-mono text-xs font-medium text-muted-foreground">
                                            {hour.toString().padStart(2, "0")}:00
                                        </span>

                                        {shouldShowHalfHour(hour) && (
                                            <span className="absolute top-[50%] left-0 right-0 -translate-y-1/2 text-center font-mono text-xs font-medium text-muted-foreground">
                                                {hour.toString().padStart(2, "0")}:30
                                            </span>
                                        )}
                                    </div>
                                ))}

                                <span className="absolute bottom-2 left-0 right-0 text-center font-mono text-xs font-medium text-muted-foreground">
                                    {END_HOUR.toString().padStart(2, "0")}:00
                                </span>

                                {showCurrentLine && (
                                    <div
                                        className="absolute left-0 right-0 z-30 -translate-y-1/2 text-center"
                                        style={{ top: currentLineTop }}
                                    >
                                        <span className="rounded-sm bg-background/80 px-1 py-0.5 font-mono text-xs font-bold text-foreground shadow-sm backdrop-blur-[1px]">
                                            {formatTime(currentTime)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex min-w-max">
                            {rooms.map((room) => (
                                <div
                                    key={room.id}
                                    className={cn(
                                        "group relative w-52 flex-shrink-0 border-r",
                                        focusedRoomId === room.id && "bg-accent/10",
                                    )}
                                >
                                    <div
                                        id={`room-col-${room.id}`}
                                        ref={(el) => roomColumnRefs?.current.set(room.id, el)}
                                        className={cn(
                                            "relative",
                                            focusedRoomId === room.id
                                                ? "bg-accent/10"
                                                : "bg-background",
                                        )}
                                        style={{ height: gridHeight }}
                                        onMouseEnter={() => setHoveredRoomId(room.id)}
                                        onMouseDown={(e) => handleMouseDownOnGrid(e, room.id)}
                                    >
                                        {hourIntervals.map((hour, idx) => (
                                            <div
                                                key={hour}
                                                className="pointer-events-none absolute w-full box-border border-b border-border/40"
                                                style={{
                                                    top: idx * pixelsPerHour,
                                                    height: pixelsPerHour,
                                                }}
                                            >
                                                <div className="relative top-[50%] h-full w-full border-b border-dashed border-border/30" />
                                            </div>
                                        ))}

                                        {showCurrentLine && (
                                            <div
                                                className="pointer-events-none absolute z-30 flex w-full items-center border-t-2 border-destructive"
                                                style={{ top: currentLineTop }}
                                            >
                                                <div className="-ml-1 h-2 w-2 rounded-full bg-destructive" />
                                            </div>
                                        )}

                                        {getRoomEvents(room.id).map((event) => (
                                            <EventBlock
                                                key={event.id}
                                                event={event}
                                                isSelected={selectedEventId === event.id}
                                                onSelect={setSelectedEventId}
                                                onDelete={onDeleteReservation}
                                                onDragStart={(e) => handleDragStartEvent(e, event)}
                                            />
                                        ))}

                                        {dragSelection &&
                                            dragSelection.roomId === room.id &&
                                            (() => {
                                                const selectionStart =
                                                    dragSelection.endTime < dragSelection.startTime
                                                        ? dragSelection.endTime
                                                        : dragSelection.startTime;
                                                const selectionEnd =
                                                    dragSelection.endTime < dragSelection.startTime
                                                        ? dragSelection.startTime
                                                        : dragSelection.endTime;

                                                const endTime =
                                                    selectionEnd.getTime() ===
                                                    selectionStart.getTime()
                                                        ? new Date(
                                                              selectionStart.getTime() +
                                                                  intervalMinutes * MS_PER_MINUTE,
                                                          )
                                                        : selectionEnd;

                                                return (
                                                    <div
                                                        className={cn(
                                                            "pointer-events-none absolute z-50 flex flex-col justify-center rounded-md border-l-[6px] border-[#1e3ad7] bg-[#dbe6fe]/50 pl-2 transition-opacity",
                                                            dragSelection.isActive
                                                                ? "opacity-70"
                                                                : "opacity-25",
                                                        )}
                                                        style={{
                                                            top: getPixelsFromTime(
                                                                selectionStart,
                                                                pixelsPerHour,
                                                            ),
                                                            height: Math.max(
                                                                getPixelsFromTime(
                                                                    endTime,
                                                                    pixelsPerHour,
                                                                ) -
                                                                    getPixelsFromTime(
                                                                        selectionStart,
                                                                        pixelsPerHour,
                                                                    ),
                                                                10,
                                                            ),
                                                            left: "2%",
                                                            width: "96%",
                                                        }}
                                                    >
                                                        <div className="font-mono text-[12px] font-bold text-[#171e54]">
                                                            {formatTime(selectionStart)} -{" "}
                                                            {formatTime(endTime)}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
