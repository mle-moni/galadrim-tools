import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { ApiOfficeRoom } from "@galadrim-tools/shared";

import type { ApiRoomReservationWithUser } from "@/integrations/backend/reservations";

import { getCanvasCoordinates, isPointInPolygon } from "../utils/coordinates";
import { useElementSize } from "../utils/useElementSize";

const BASE_WIDTH = 1980;
const BASE_HEIGHT = 1080;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

function isReservedNow(roomId: number, reservations: ApiRoomReservationWithUser[], now: Date) {
    return reservations.some((r) => {
        if (r.officeRoomId !== roomId) return false;
        const start = new Date(r.start);
        const end = new Date(r.end);
        return start < now && now < end;
    });
}

function getRoomAtPoint(
    rooms: ApiOfficeRoom[],
    point: { x: number; y: number },
    canvas: HTMLCanvasElement,
): ApiOfficeRoom | null {
    for (let i = rooms.length - 1; i >= 0; i--) {
        const room = rooms[i];
        const polygon = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
        if (polygon.length < 3) continue;
        if (isPointInPolygon(point, polygon)) return room;
    }

    return null;
}

export default function OfficeFloorCanvas(props: {
    rooms: ApiOfficeRoom[];
    reservations: ApiRoomReservationWithUser[];
    onRoomClick: (room: ApiOfficeRoom) => void;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { width: wrapperWidth } = useElementSize(wrapperRef);

    const canvasWidth = useMemo(() => {
        const target = Math.min(500, Math.max(360, Math.floor(wrapperWidth || 500)));
        return target;
    }, [wrapperWidth]);

    const canvasHeight = useMemo(() => {
        return Math.floor(canvasWidth / ASPECT_RATIO);
    }, [canvasWidth]);

    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipSize, setTooltipSize] = useState<{ width: number; height: number } | null>(null);

    const hoveredRoom = useMemo(() => {
        if (hoveredRoomId === null) return null;
        return props.rooms.find((room) => room.id === hoveredRoomId) ?? null;
    }, [hoveredRoomId, props.rooms]);

    const hoveredRoomReservedNow = useMemo(() => {
        if (!hoveredRoom) return null;
        return isReservedNow(hoveredRoom.id, props.reservations, new Date());
    }, [hoveredRoom, props.reservations]);

    useLayoutEffect(() => {
        if (!hoveredRoom) {
            setTooltipSize(null);
            return;
        }

        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const rect = tooltip.getBoundingClientRect();
        setTooltipSize({ width: rect.width, height: rect.height });
    }, [hoveredRoom, hoveredRoomReservedNow]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const now = new Date();

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Background
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        for (const room of props.rooms) {
            const polygon = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
            if (polygon.length < 3) continue;

            const reserved = isReservedNow(room.id, props.reservations, now);
            const isHovered = hoveredRoomId === room.id;

            const fill = reserved ? "#fecaca" : "#dcfce7"; // error-200 / success-100
            const hoverFill = reserved ? "#fca5a5" : "#bbf7d0"; // error-300 / success-200

            ctx.beginPath();
            polygon.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            ctx.fillStyle = isHovered ? hoverFill : fill;
            ctx.fill();

            ctx.strokeStyle = reserved ? "#fca5a5" : "#bbf7d0";
            ctx.lineWidth = isHovered ? 1.5 : 1;
            ctx.stroke();
        }
    }, [canvasHeight, canvasWidth, hoveredRoomId, props.reservations, props.rooms]);

    return (
        <div ref={wrapperRef} className="relative h-[275px] w-full max-w-[500px]">
            {hoveredRoom && hoveredPoint && (
                <div
                    ref={tooltipRef}
                    className="pointer-events-none absolute z-50 max-w-[220px] rounded-md border bg-background/95 px-2 py-1 text-xs shadow-sm backdrop-blur"
                    style={{
                        left: (() => {
                            const offset = 20;
                            const width = tooltipSize?.width ?? 220;

                            const canFitRight = hoveredPoint.x + offset + width <= canvasWidth;
                            const preferred = canFitRight
                                ? hoveredPoint.x + offset
                                : hoveredPoint.x - offset - width;

                            return Math.min(Math.max(0, preferred), canvasWidth - width);
                        })(),
                        top: (() => {
                            const offset = 20;
                            const height = tooltipSize?.height ?? 48;

                            const canFitAbove = hoveredPoint.y - offset - height >= 0;
                            const preferred = canFitAbove
                                ? hoveredPoint.y - offset - height
                                : hoveredPoint.y + offset;

                            return Math.min(Math.max(0, preferred), canvasHeight - height);
                        })(),
                    }}
                >
                    <div className="font-semibold text-foreground">{hoveredRoom.name}</div>
                    {hoveredRoomReservedNow !== null && (
                        <div
                            className={
                                hoveredRoomReservedNow ? "text-destructive" : "text-emerald-700"
                            }
                        >
                            {hoveredRoomReservedNow ? "Occupée" : "Libre"}
                        </div>
                    )}
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseMove={(event) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;

                    const hovered = getRoomAtPoint(props.rooms, { x, y }, canvas);
                    setHoveredRoomId(hovered?.id ?? null);
                    setHoveredPoint(hovered ? { x, y } : null);
                    canvas.style.cursor = hovered ? "pointer" : "default";
                }}
                onMouseLeave={() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    setHoveredRoomId(null);
                    setHoveredPoint(null);
                    canvas.style.cursor = "default";
                }}
                onClick={(event) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const rect = canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;

                    const clicked = getRoomAtPoint(props.rooms, { x, y }, canvas);
                    if (!clicked) return;
                    props.onRoomClick(clicked);
                }}
                style={{ display: "block" }}
            />
        </div>
    );
}
