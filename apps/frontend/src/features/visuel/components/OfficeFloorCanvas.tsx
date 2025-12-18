import { useEffect, useMemo, useRef, useState } from "react";

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
        const target = Math.min(560, Math.max(360, Math.floor(wrapperWidth || 560)));
        return target;
    }, [wrapperWidth]);

    const canvasHeight = useMemo(() => {
        return Math.floor(canvasWidth / ASPECT_RATIO);
    }, [canvasWidth]);

    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);

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

            const fill = reserved ? "#fecaca" : "#bbf7d0"; // red-200 / green-200
            const hoverFill = reserved ? "#fca5a5" : "#86efac"; // red-300 / green-300

            ctx.beginPath();
            polygon.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            ctx.fillStyle = isHovered ? hoverFill : fill;
            ctx.fill();

            ctx.strokeStyle = isHovered ? "#ffffff" : "rgba(255,255,255,0.55)";
            ctx.lineWidth = isHovered ? 2 : 1;
            ctx.stroke();
        }
    }, [canvasHeight, canvasWidth, hoveredRoomId, props.reservations, props.rooms]);

    return (
        <div ref={wrapperRef} className="w-[560px] max-w-[70vw]">
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
                    canvas.style.cursor = hovered ? "pointer" : "default";
                }}
                onMouseLeave={() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    setHoveredRoomId(null);
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
