import { cn } from "@/lib/utils";

import { TIME_COLUMN_WIDTH } from "./constants";
import type { Room } from "./types";

export default function SchedulerGridRoomHeaderRow(props: {
    rooms: Room[];
    focusedRoomId?: number;
    setRoomHeaderRef: (roomId: number, element: HTMLDivElement | null) => void;
    onRoomHover: (roomId: number) => void;
}) {
    return (
        <div className="sticky top-0 z-[75] flex">
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
                        "flex h-10 w-52 flex-shrink-0 items-center justify-center border-b border-r bg-muted/30 text-sm font-semibold text-foreground shadow-sm",
                        props.focusedRoomId === room.id && "bg-accent/30",
                    )}
                    onMouseEnter={() => props.onRoomHover(room.id)}
                >
                    <span className="truncate px-2" title={room.name}>
                        {room.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
