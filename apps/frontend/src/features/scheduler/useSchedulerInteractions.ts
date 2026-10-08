import type React from "react";
import { useEffect, useRef, useState } from "react";

import { END_HOUR, START_HOUR } from "./constants";
import type { DragSelection, Reservation } from "./types";
import { getTimeFromPixels, roundToNearestMinutes } from "./utils";

const MS_PER_MINUTE = 60_000;
const SELECTION_ACTIVATE_DELAY_MS = 100;
const TAP_RESERVATION_MINUTES = 30;
const LONG_PRESS_MS = 400;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

interface TouchPress {
    pointerId: number;
    timeoutId: number;
    roomId: number;
    startTime: Date;
    tapEndTime: Date;
    clientX: number;
    clientY: number;
}

interface MovingState {
    originalReservation: Reservation;
    currentReservation: Reservation;
    clickTimeOffsetMinutes: number;
}

export function useSchedulerInteractions(input: {
    currentDate: Date;
    pixelsPerHour: number;
    gridHeight: number;
    intervalMinutes: number;
    getRoomColumnElement: (roomId: number) => HTMLDivElement | null;
    onAddReservation: (reservation: Pick<Reservation, "roomId" | "startTime" | "endTime">) => void;
    onUpdateReservation: (reservation: Reservation) => void;
}) {
    const dragActivateTimeoutRef = useRef<number | null>(null);
    const touchPressRef = useRef<TouchPress | null>(null);
    const touchDragActiveRef = useRef(false);
    const pendingTapRef = useRef<TouchPress | null>(null);

    useEffect(() => {
        return () => {
            if (dragActivateTimeoutRef.current !== null) {
                window.clearTimeout(dragActivateTimeoutRef.current);
                dragActivateTimeoutRef.current = null;
            }
            if (touchPressRef.current) window.clearTimeout(touchPressRef.current.timeoutId);
        };
    }, []);

    const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
    const [movingState, setMovingState] = useState<MovingState | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);

    const handleSelectionMove = (e: React.MouseEvent) => {
        if (!dragSelection) return;

        const gridContent = input.getRoomColumnElement(dragSelection.roomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const safeOffsetY = Math.min(Math.max(0, offsetY), input.gridHeight);

        const rawTime = getTimeFromPixels(safeOffsetY, input.currentDate, input.pixelsPerHour);
        let snappedTime = roundToNearestMinutes(rawTime, input.intervalMinutes);

        const maxDate = new Date(input.currentDate);
        maxDate.setHours(END_HOUR, 0, 0, 0);
        if (snappedTime > maxDate) snappedTime = maxDate;

        setDragSelection((prev) => (prev ? { ...prev, endTime: snappedTime } : null));
    };

    const handleEventMove = (e: React.MouseEvent) => {
        if (!movingState || !hoveredRoomId) return;

        const gridContent = input.getRoomColumnElement(hoveredRoomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        const mouseTime = getTimeFromPixels(offsetY, input.currentDate, input.pixelsPerHour);
        const mouseTimeMinutes = mouseTime.getHours() * 60 + mouseTime.getMinutes();

        let newStartMinutes = mouseTimeMinutes - movingState.clickTimeOffsetMinutes;
        newStartMinutes =
            Math.round(newStartMinutes / input.intervalMinutes) * input.intervalMinutes;

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

        const newStart = new Date(input.currentDate);
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

        const startTime = getTimeFromPixels(offsetY, input.currentDate, input.pixelsPerHour);
        const snappedStart = roundToNearestMinutes(startTime, input.intervalMinutes);

        const endOfDay = new Date(input.currentDate);
        endOfDay.setHours(END_HOUR, 0, 0, 0);

        if (snappedStart >= endOfDay) return;

        const snappedEnd = new Date(
            Math.min(
                snappedStart.getTime() + input.intervalMinutes * MS_PER_MINUTE,
                endOfDay.getTime(),
            ),
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

    // On touch a plain drag must keep scrolling the grid, so a selection starts on a long press. A quick
    // tap books on click, which browsers don't fire for a touch that only stops a scroll fling.
    const endTouchPress = () => {
        if (touchPressRef.current) window.clearTimeout(touchPressRef.current.timeoutId);
        touchPressRef.current = null;
    };

    const cancelTouchPress = () => {
        endTouchPress();
        if (touchDragActiveRef.current) {
            touchDragActiveRef.current = false;
            setDragSelection(null);
        }
    };

    const getTouchHandlers = (roomId: number): React.HTMLAttributes<HTMLDivElement> => ({
        onPointerDown: (e) => {
            pendingTapRef.current = null;
            if (e.pointerType !== "touch" || !e.isPrimary || e.target !== e.currentTarget) return;
            cancelTouchPress();

            const rect = e.currentTarget.getBoundingClientRect();
            const startTime = roundToNearestMinutes(
                getTimeFromPixels(e.clientY - rect.top, input.currentDate, input.pixelsPerHour),
                input.intervalMinutes,
            );
            const endOfDay = new Date(input.currentDate);
            endOfDay.setHours(END_HOUR, 0, 0, 0);
            if (startTime >= endOfDay) return;
            const capAtEndOfDay = (minutes: number) =>
                new Date(
                    Math.min(startTime.getTime() + minutes * MS_PER_MINUTE, endOfDay.getTime()),
                );

            touchPressRef.current = {
                pointerId: e.pointerId,
                roomId,
                startTime,
                tapEndTime: capAtEndOfDay(TAP_RESERVATION_MINUTES),
                clientX: e.clientX,
                clientY: e.clientY,
                timeoutId: window.setTimeout(() => {
                    touchDragActiveRef.current = true;
                    setSelectedEventId(null);
                    setDragSelection({
                        roomId,
                        startTime,
                        endTime: capAtEndOfDay(input.intervalMinutes),
                        isDragging: true,
                        isActive: true,
                    });
                }, LONG_PRESS_MS),
            };
        },
        onPointerMove: (e) => {
            const press = touchPressRef.current;
            if (e.pointerId !== press?.pointerId) return;
            if (touchDragActiveRef.current) {
                handleSelectionMove(e);
                return;
            }
            if (
                Math.hypot(e.clientX - press.clientX, e.clientY - press.clientY) >
                LONG_PRESS_MOVE_TOLERANCE_PX
            ) {
                endTouchPress();
            }
        },
        onPointerUp: (e) => {
            if (e.pointerId !== touchPressRef.current?.pointerId) return;
            if (touchDragActiveRef.current) {
                touchDragActiveRef.current = false;
                endTouchPress();
                handleMouseUp();
                return;
            }

            pendingTapRef.current = touchPressRef.current;
            endTouchPress();
        },
        onClick: () => {
            const press = pendingTapRef.current;
            pendingTapRef.current = null;
            if (!press) return;

            input.onAddReservation({
                roomId: press.roomId,
                startTime: press.startTime,
                endTime: press.tapEndTime,
            });
        },
        onPointerCancel: (e) => {
            if (e.pointerId !== touchPressRef.current?.pointerId) return;
            cancelTouchPress();
        },
        onContextMenu: (e) => {
            if (touchPressRef.current) e.preventDefault();
        },
    });

    const handleDragStartEvent = (e: React.MouseEvent, event: Reservation) => {
        if (!event.canEdit) return;

        const gridContent = input.getRoomColumnElement(event.roomId);
        if (!gridContent) return;

        const rect = gridContent.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickTime = getTimeFromPixels(clickY, input.currentDate, input.pixelsPerHour);

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

                const endOfDay = new Date(input.currentDate);
                endOfDay.setHours(END_HOUR, 0, 0, 0);

                if (selectionStart >= endOfDay) {
                    setDragSelection(null);
                    return;
                }

                const rawEndTime =
                    selectionEnd.getTime() === selectionStart.getTime()
                        ? new Date(selectionStart.getTime() + input.intervalMinutes * MS_PER_MINUTE)
                        : selectionEnd;

                const endTime = rawEndTime > endOfDay ? endOfDay : rawEndTime;

                if (endTime <= selectionStart) {
                    setDragSelection(null);
                    return;
                }

                input.onAddReservation({
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
            const { originalReservation, currentReservation } = movingState;

            const hasReservationChanged =
                currentReservation.roomId !== originalReservation.roomId ||
                currentReservation.startTime.getTime() !==
                    originalReservation.startTime.getTime() ||
                currentReservation.endTime.getTime() !== originalReservation.endTime.getTime();

            // Avoid no-op PUTs when the user simply clicks/double-clicks an event.
            // These extra updates can race with deletes via sockets + optimistic cache updates,
            // causing a late update to re-add a reservation that was just deleted.
            if (hasReservationChanged) {
                input.onUpdateReservation(currentReservation);
            }

            setMovingState(null);
        }
    };

    return {
        dragSelection,
        movingState,
        selectedEventId,
        hoveredRoomId,
        setHoveredRoomId,
        setSelectedEventId,
        handleGlobalMouseMove,
        handleMouseDownOnGrid,
        getTouchHandlers,
        touchDragActiveRef,
        handleMouseUp,
        handleDragStartEvent,
    };
}
