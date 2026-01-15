import type React from "react";

import { cn } from "@/lib/utils";

import type { Reservation, Room } from "./types";
import type { calculateEventLayout } from "./utils";
import EventBlock from "./EventBlock";
import DragSelectionOverlay from "./DragSelectionOverlay";

export default function SchedulerRoomColumn({
    room,
    focusedRoomId,
    gridHeight,
    pixelsPerHour,
    hourIntervals,
    events,
    selectedEventId,
    onSelectEventId,
    onDeleteReservation,
    onDragStartEvent,
    onMouseDown,
    onMouseEnter,
    setRoomColumnRef,
    dragSelection,
    intervalMinutes,
    showCurrentLine,
    currentLineTop,
}: {
    room: Room;
    focusedRoomId?: number;
    gridHeight: number;
    pixelsPerHour: number;
    hourIntervals: number[];
    events: ReturnType<typeof calculateEventLayout>;
    selectedEventId: number | null;
    onSelectEventId: (id: number | null) => void;
    onDeleteReservation: (id: Reservation["id"]) => void;
    onDragStartEvent: (e: React.MouseEvent, event: Reservation) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    setRoomColumnRef: (el: HTMLDivElement | null) => void;
    dragSelection: import("./types").DragSelection | null;
    intervalMinutes: number;
    showCurrentLine: boolean;
    currentLineTop: number;
}) {
    return (
        <div
            className={cn(
                "group relative w-52 flex-shrink-0 border-r",
                focusedRoomId === room.id && "bg-accent/10",
            )}
            data-snowfall="ignore"
        >
            <div
                id={`room-col-${room.id}`}
                ref={setRoomColumnRef}
                className={cn(
                    "relative",
                    focusedRoomId === room.id ? "bg-accent/10" : "bg-background",
                )}
                style={{ height: gridHeight }}
                onMouseEnter={onMouseEnter}
                onMouseDown={onMouseDown}
                data-snowfall="ignore"
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

                {events.map((event) => (
                    <EventBlock
                        key={event.id}
                        event={event}
                        isSelected={selectedEventId === event.id}
                        onSelect={onSelectEventId}
                        onDelete={onDeleteReservation}
                        onDragStart={(e) => onDragStartEvent(e, event)}
                    />
                ))}

                <DragSelectionOverlay
                    dragSelection={dragSelection}
                    roomId={room.id}
                    intervalMinutes={intervalMinutes}
                    pixelsPerHour={pixelsPerHour}
                />
            </div>
        </div>
    );
}
