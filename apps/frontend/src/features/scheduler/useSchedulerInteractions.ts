import type React from "react";
import { useEffect, useRef, useState } from "react";

import { END_HOUR, START_HOUR } from "./constants";
import type { DragSelection, Reservation } from "./types";
import { getTimeFromPixels, roundToNearestMinutes } from "./utils";

const MS_PER_MINUTE = 60_000;
const SELECTION_ACTIVATE_DELAY_MS = 100;

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

    useEffect(() => {
        return () => {
            if (dragActivateTimeoutRef.current !== null) {
                window.clearTimeout(dragActivateTimeoutRef.current);
                dragActivateTimeoutRef.current = null;
            }
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
        handleMouseUp,
        handleDragStartEvent,
    };
}
