import { useMemo } from "react";

import { ROOM_HEADER_COLORS, TIME_COLUMN_WIDTH } from "./constants";
import type { Room } from "./types";
import { cn } from "@/lib/utils";

export default function SchedulerGridRoomHeaderRow(props: {
    rooms: Array<Room>;
    focusedRoomId?: number;
    setRoomHeaderRef: (roomId: number, element: HTMLDivElement | null) => void;
    onRoomHover: (roomId: number) => void;
}) {
    const floorColors = useMemo(() => {
        const floorsList = [...new Set(props.rooms.map((room) => room.floor))].sort(
            (a, b) => a - b,
        );
        const colorMap = new Map<number, string>();

        floorsList.forEach((floor, index) => {
            const colorIndex = index % 2;
            colorMap.set(floor, ROOM_HEADER_COLORS[colorIndex]);
        });

        return colorMap;
    }, [props.rooms]);

    return (
        <div className="sticky top-0 z-[75] flex" data-snowfall="ignore">
            <div
                className="sticky left-0 z-[80] flex h-10 flex-shrink-0 items-center justify-center border-b border-r bg-background shadow-sm"
                style={{ width: TIME_COLUMN_WIDTH }}
            >
                <span className="text-sm font-semibold text-muted-foreground">Heure</span>
            </div>

            {props.rooms.map((room) => (
                <div
                    key={room.id}
                    id={`room-header-${room.id}`}
                    ref={(el) => {
                        props.setRoomHeaderRef(room.id, el);
                    }}
                    className={cn(
                        "flex h-10 w-52 flex-shrink-0 items-center justify-center border-b border-r text-sm font-semibold shadow-sm",
                        floorColors.get(room.floor),
                        props.focusedRoomId === room.id && "bg-accent/30",
                    )}
                    onMouseEnter={() => props.onRoomHover(room.id)}
                    data-snowfall="ignore"
                >
                    <span className="truncate px-2" title={room.name}>
                        {room.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
