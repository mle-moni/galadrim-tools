import type React from "react";

import type { LayoutEvent } from "./types";
import { formatTime } from "./utils";

import { cn } from "@/lib/utils";

interface EventBlockProps {
    event: LayoutEvent;
    isSelected: boolean;
    onSelect: (id: number | null) => void;
    onDelete: (id: number) => void;
    onDragStart: (e: React.MouseEvent, event: LayoutEvent) => void;
}

export default function EventBlock({
    event,
    isSelected,
    onSelect,
    onDelete,
    onDragStart,
}: EventBlockProps) {
    const durationMinutes = Math.round(
        (event.endTime.getTime() - event.startTime.getTime()) / 60000,
    );

    const isInline = durationMinutes <= 30;
    const isCompact = durationMinutes <= 60;
    const minHeight = isInline ? 18 : 20;

    const containerClasses = cn(
        "absolute flex select-none overflow-hidden rounded-md border-l-[6px] shadow-sm transition-none",
        event.canEdit ? "cursor-pointer" : "cursor-default",
        event.color,
        isInline
            ? "flex-row items-center gap-2 px-2 py-1"
            : isCompact
              ? "flex-col gap-0.5 p-1.5"
              : "flex-col p-2",
        !event.canEdit
            ? "z-10"
            : isSelected
              ? "z-50 ring-2 ring-[#1e3ad7] ring-offset-2 ring-offset-background"
              : "z-10 hover:z-40 hover:brightness-95",
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!event.canEdit) return;

        onDragStart(e, event);
        onSelect(event.id);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!event.canEdit) return;

        onDelete(event.id);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            className={containerClasses}
            style={{
                top: `${event.top}px`,
                height: `${Math.max(event.height, minHeight)}px`,
                left: `${event.left}%`,
                width: `${event.width}%`,
            }}
        >
            {isInline ? (
                <>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
                        {event.owner}
                    </span>
                    <span className="shrink-0 font-mono text-xs leading-tight tracking-wide opacity-90">
                        {formatTime(event.startTime)}-{formatTime(event.endTime)}
                    </span>
                </>
            ) : (
                <>
                    <div className="truncate text-sm font-semibold leading-tight">
                        {event.owner}
                    </div>
                    <div className="font-mono text-xs leading-tight tracking-wide opacity-90">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </div>
                </>
            )}
        </div>
    );
}
