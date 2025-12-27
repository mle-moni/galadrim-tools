import { cn } from "@/lib/utils";

import type { DragSelection } from "./types";
import { formatTime, getPixelsFromTime } from "./utils";

const MS_PER_MINUTE = 60_000;

function getSelectionRange(selection: DragSelection) {
    const start = selection.endTime < selection.startTime ? selection.endTime : selection.startTime;
    const end = selection.endTime < selection.startTime ? selection.startTime : selection.endTime;
    return { start, end };
}

export default function DragSelectionOverlay({
    dragSelection,
    roomId,
    intervalMinutes,
    pixelsPerHour,
}: {
    dragSelection: DragSelection | null;
    roomId: number;
    intervalMinutes: number;
    pixelsPerHour: number;
}) {
    if (!dragSelection || dragSelection.roomId !== roomId) return null;

    const { start, end } = getSelectionRange(dragSelection);

    const endTime =
        end.getTime() === start.getTime()
            ? new Date(start.getTime() + intervalMinutes * MS_PER_MINUTE)
            : end;

    const top = getPixelsFromTime(start, pixelsPerHour);
    const height = Math.max(getPixelsFromTime(endTime, pixelsPerHour) - top, 10);

    return (
        <div
            className={cn(
                "pointer-events-none absolute z-50 flex flex-col justify-center rounded-md border-l-[6px] border-[#1e3ad7] bg-[#dbe6fe]/50 pl-2 transition-opacity",
                dragSelection.isActive ? "opacity-70" : "opacity-25",
            )}
            style={{
                top,
                height,
                left: "2%",
                width: "96%",
            }}
        >
            <div className="font-mono text-[12px] font-bold text-[#171e54]">
                {formatTime(start)} - {formatTime(endTime)}
            </div>
        </div>
    );
}
