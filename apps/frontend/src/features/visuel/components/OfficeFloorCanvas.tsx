import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useNow } from "@/debug/clock";

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

function getActiveReservation(
    roomId: number,
    reservations: ApiRoomReservationWithUser[],
    now: Date,
): ApiRoomReservationWithUser | null {
    const active = reservations.filter((r) => {
        if (r.officeRoomId !== roomId) return false;
        const start = new Date(r.start);
        const end = new Date(r.end);
        return start < now && now < end;
    });

    if (active.length === 0) return null;

    active.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return active[0] ?? null;
}

function getReservationOwnerLabel(reservation: ApiRoomReservationWithUser): string {
    return reservation.user?.username ?? reservation.titleComputed ?? "Quelqu'un";
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

    const now = useNow({ intervalMs: 60_000 });

    const hoveredRoomReservedNow = useMemo(() => {
        if (!hoveredRoom) return null;
        if (!hoveredRoom.isBookable) return null;
        return isReservedNow(hoveredRoom.id, props.reservations, now);
    }, [hoveredRoom, now, props.reservations]);

    const hoveredRoomActiveReservation = useMemo(() => {
        if (!hoveredRoom) return null;
        if (!hoveredRoom.isBookable) return null;
        return getActiveReservation(hoveredRoom.id, props.reservations, now);
    }, [hoveredRoom, now, props.reservations]);

    const tooltipStyle = useMemo<CSSProperties | undefined>(() => {
        if (!hoveredRoom || !hoveredPoint) return undefined;

        const offset = 20;
        const width = tooltipSize?.width ?? 220;
        const height = tooltipSize?.height ?? 48;

        const canFitRight = hoveredPoint.x + offset + width <= canvasWidth;
        const preferredLeft = canFitRight
            ? hoveredPoint.x + offset
            : hoveredPoint.x - offset - width;
        const left = Math.min(Math.max(0, preferredLeft), canvasWidth - width);

        const canFitAbove = hoveredPoint.y - offset - height >= 0;
        const preferredTop = canFitAbove
            ? hoveredPoint.y - offset - height
            : hoveredPoint.y + offset;
        const top = Math.min(Math.max(0, preferredTop), canvasHeight - height);

        return { left, top };
    }, [
        canvasHeight,
        canvasWidth,
        hoveredPoint,
        hoveredRoom,
        tooltipSize?.height,
        tooltipSize?.width,
    ]);

    const hoveredRoomStatus = useMemo(() => {
        if (!hoveredRoom) return null;

        if (!hoveredRoom.isBookable) {
            return { className: "text-slate-600", text: "Non réservable" };
        }

        if (hoveredRoomReservedNow === null) return null;

        if (hoveredRoomReservedNow) {
            const owner = hoveredRoomActiveReservation
                ? ` par ${getReservationOwnerLabel(hoveredRoomActiveReservation)}`
                : "";
            return { className: "text-destructive", text: `Occupée${owner}` };
        }

        return { className: "text-emerald-700", text: "Libre" };
    }, [hoveredRoom, hoveredRoomActiveReservation, hoveredRoomReservedNow]);

    useLayoutEffect(() => {
        if (!hoveredRoom) {
            setTooltipSize(null);
            return;
        }

        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const rect = tooltip.getBoundingClientRect();
        setTooltipSize({ width: rect.width, height: rect.height });
    }, [hoveredRoom]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        for (const room of props.rooms) {
            const polygon = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
            if (polygon.length < 3) continue;

            const reserved = room.isBookable && isReservedNow(room.id, props.reservations, now);
            const isHovered = hoveredRoomId === room.id;

            const fill = !room.isBookable
                ? "#e2e8f0" // slate-200
                : reserved
                  ? "#fecaca" // red-200
                  : "#dcfce7"; // green-100
            const hoverFill = !room.isBookable
                ? "#cbd5e1" // slate-300
                : reserved
                  ? "#fca5a5" // red-300
                  : "#bbf7d0"; // green-200

            ctx.beginPath();
            polygon.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            ctx.fillStyle = isHovered ? hoverFill : fill;
            ctx.fill();

            ctx.strokeStyle = !room.isBookable
                ? isHovered
                    ? "#64748b"
                    : "#94a3b8" // slate-500 / slate-400
                : reserved
                  ? "#fca5a5" // red-300
                  : "#bbf7d0"; // green-200
            ctx.lineWidth = isHovered ? 1.5 : 1;
            ctx.stroke();
        }
    }, [canvasHeight, canvasWidth, hoveredRoomId, now, props.reservations, props.rooms]);

    return (
        <div ref={wrapperRef} className="relative h-[275px] w-full max-w-[500px]">
            {hoveredRoom && hoveredPoint && (
                <div
                    ref={tooltipRef}
                    className="pointer-events-none absolute z-50 max-w-[220px] rounded-md border bg-background/95 px-2 py-1 text-xs shadow-sm backdrop-blur"
                    style={tooltipStyle}
                >
                    <div className="font-semibold text-foreground">{hoveredRoom.name}</div>
                    {hoveredRoomStatus && (
                        <div className={hoveredRoomStatus.className}>{hoveredRoomStatus.text}</div>
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
                    const scaleX = rect.width ? canvas.width / rect.width : 1;
                    const scaleY = rect.height ? canvas.height / rect.height : 1;

                    const x = (event.clientX - rect.left) * scaleX;
                    const y = (event.clientY - rect.top) * scaleY;

                    const hovered = getRoomAtPoint(props.rooms, { x, y }, canvas);
                    setHoveredRoomId(hovered?.id ?? null);
                    setHoveredPoint(hovered ? { x, y } : null);
                    canvas.style.cursor = hovered?.isBookable ? "pointer" : "default";
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
                    const scaleX = rect.width ? canvas.width / rect.width : 1;
                    const scaleY = rect.height ? canvas.height / rect.height : 1;

                    const x = (event.clientX - rect.left) * scaleX;
                    const y = (event.clientY - rect.top) * scaleY;

                    const clicked = getRoomAtPoint(props.rooms, { x, y }, canvas);
                    if (!clicked) return;
                    if (!clicked.isBookable) return;
                    props.onRoomClick(clicked);
                }}
                style={{ display: "block" }}
            />
        </div>
    );
}
