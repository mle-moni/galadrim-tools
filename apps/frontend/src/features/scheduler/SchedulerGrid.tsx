import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

function parseDevNow(raw: string, currentDate: Date): Date | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const hhmmMatch = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
    if (hhmmMatch) {
        const hours = Number(hhmmMatch[1]);
        const minutes = Number(hhmmMatch[2]);
        const next = new Date(currentDate);
        next.setHours(hours, minutes, 0, 0);
        return next;
    }

    const offsetMinutesMatch = /^[+-]\d+$/.exec(trimmed);
    if (offsetMinutesMatch) {
        const offsetMinutes = Number(trimmed);
        if (!Number.isFinite(offsetMinutes)) return null;
        return new Date(Date.now() + offsetMinutes * 60_000);
    }

    const parsed = new Date(trimmed);
    if (!Number.isFinite(parsed.getTime())) return null;
    return parsed;
}

const DEBUG_STATE_KEY = "scheduler.debug";

type DebugState = {
    open: boolean;
    devNowRaw: string | null;
    devNowDraft: string;
};

function isLocalDebugHost(): boolean {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname;
    return hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname === "::1";
}

function loadDebugState(): DebugState {
    if (!isLocalDebugHost()) return { open: false, devNowRaw: null, devNowDraft: "" };

    try {
        const raw = window.sessionStorage.getItem(DEBUG_STATE_KEY);
        if (!raw) return { open: false, devNowRaw: null, devNowDraft: "" };

        const parsed = JSON.parse(raw) as Partial<DebugState>;
        const devNowRaw = typeof parsed.devNowRaw === "string" ? parsed.devNowRaw : null;
        const devNowDraft =
            typeof parsed.devNowDraft === "string" ? parsed.devNowDraft : devNowRaw ?? "";

        return {
            open: Boolean(parsed.open),
            devNowRaw,
            devNowDraft,
        };
    } catch {
        return { open: false, devNowRaw: null, devNowDraft: "" };
    }
}

function saveDebugState(state: DebugState) {
    if (!isLocalDebugHost()) return;

    try {
        if (!state.open && !state.devNowRaw && !state.devNowDraft) {
            window.sessionStorage.removeItem(DEBUG_STATE_KEY);
            return;
        }

        window.sessionStorage.setItem(DEBUG_STATE_KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

interface SchedulerGridProps {
    currentDate: Date;
    rooms: Room[];
    reservations: Reservation[];
    onAddReservation: (reservation: Pick<Reservation, "roomId" | "startTime" | "endTime">) => void;
    onUpdateReservation: (reservation: Reservation) => void;
    onDeleteReservation: (id: Reservation["id"]) => void;
    isFiveMinuteSlots: boolean;
    focusedRoomId?: number;
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
}: SchedulerGridProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragActivateTimeoutRef = useRef<number | null>(null);

    const [debug, setDebug] = useState<DebugState>(() => loadDebugState());
    const { open: debugOpen, devNowRaw, devNowDraft } = debug;

    const devNow = useMemo(() => {
        if (!devNowRaw) return null;
        return parseDevNow(devNowRaw, currentDate);
    }, [currentDate, devNowRaw]);

    const devNowDraftParsed = useMemo(() => {
        if (!devNowDraft.trim()) return null;
        return parseDevNow(devNowDraft, currentDate);
    }, [currentDate, devNowDraft]);

    const pixelsPerHour = DEFAULT_PIXELS_PER_HOUR;
    const gridHeight = HOURS_COUNT * pixelsPerHour;

    const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
    const [movingState, setMovingState] = useState<MovingState | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(() => devNow ?? new Date());
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);

    useEffect(() => {
        if (!focusedRoomId) return;
        if (!rooms.some((r) => r.id === focusedRoomId)) return;

        const container = containerRef.current;
        if (!container) return;

        const roomHeader = document.getElementById(`room-header-${focusedRoomId}`);
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
    }, [focusedRoomId, rooms]);

    useEffect(() => {
        if (devNow) {
            setCurrentTime(devNow);
            return;
        }

        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [devNow]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const now = devNow ?? new Date();
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
    }, [currentDate, devNow, gridHeight, pixelsPerHour]);

    const intervalMinutes = isFiveMinuteSlots ? 5 : 15;
    const selectionActivateDelayMs = 100;

    const isDev = isLocalDebugHost();

    useEffect(() => {
        if (!isDev) return;
        saveDebugState(debug);
    }, [debug, isDev]);

    const applyDevNow = () => {
        const trimmed = devNowDraft.trim();
        setDebug((prev) => ({ ...prev, devNowRaw: trimmed || null, devNowDraft: trimmed }));
    };

    const clearDevNow = () => {
        setDebug((prev) => ({ ...prev, devNowRaw: null, devNowDraft: "" }));
    };

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

        const gridContent = document.getElementById(`room-col-${dragSelection.roomId}`);
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

        const gridContent = document.getElementById(`room-col-${hoveredRoomId}`);
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
            60000;

        if (newStartMinutes < minMinutes) newStartMinutes = minMinutes;
        if (newStartMinutes + durationMinutes > maxMinutes) {
            newStartMinutes = maxMinutes - durationMinutes;
        }

        const newStart = new Date(currentDate);
        newStart.setHours(Math.floor(newStartMinutes / 60), newStartMinutes % 60, 0, 0);

        const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

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
        const snappedEnd = new Date(snappedStart.getTime() + intervalMinutes * 60000);

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
        }, selectionActivateDelayMs);
    };

    const handleDragStartEvent = (e: React.MouseEvent, event: Reservation) => {
        if (!event.canEdit) return;

        const gridContent = document.getElementById(`room-col-${event.roomId}`);
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

                const endTime =
                    selectionEnd.getTime() === selectionStart.getTime()
                        ? new Date(selectionStart.getTime() + intervalMinutes * 60000)
                        : selectionEnd;

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
            className="relative flex h-full flex-1 min-w-0 select-none overflow-hidden"
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className="h-full min-w-0 flex-1 overflow-auto bg-background"
                ref={containerRef}
                onWheel={handleWheel}
            >
                <div className="min-w-max">
                    <div className="sticky top-0 z-40 flex">
                        <div
                            className="sticky left-0 z-50 flex h-10 flex-shrink-0 items-center justify-center border-b border-r bg-muted/30 shadow-sm"
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
                            className="sticky left-0 z-30 flex flex-shrink-0 flex-col border-r bg-card shadow-sm"
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
                                                                  intervalMinutes * 60000,
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

            {isDev && (
                <div
                    className="pointer-events-auto absolute bottom-3 left-3 z-[60] w-80 rounded-md border bg-card/95 p-3 shadow-lg backdrop-blur-sm"
                    onMouseDown={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">Debug mode</div>
                            <div className="text-xs text-muted-foreground">
                                {devNow ? `Active: ${formatTime(devNow)}` : "Active: real time"}
                            </div>
                        </div>
                        <Switch
                            checked={debugOpen}
                            onCheckedChange={(open) => setDebug((prev) => ({ ...prev, open }))}
                        />
                    </div>

                    {debugOpen && (
                        <div className="mt-3 flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="scheduler-dev-now" className="text-xs">
                                    Fake current time
                                </Label>
                                <Input
                                    id="scheduler-dev-now"
                                    value={devNowDraft}
                                    onChange={(e) =>
                                        setDebug((prev) => ({
                                            ...prev,
                                            devNowDraft: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") applyDevNow();
                                    }}
                                    placeholder="14:30 | +90 | 2025-12-23T14:30"
                                />
                                {devNowDraft.trim().length > 0 && !devNowDraftParsed && (
                                    <div className="text-xs text-destructive">
                                        Invalid format. Use `HH:MM`, `+/-minutes`, or an ISO date.
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="h-8"
                                    onClick={applyDevNow}
                                >
                                    Apply
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8"
                                    onClick={clearDevNow}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
