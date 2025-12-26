import { useEffect, useMemo, useRef, useState } from "react";

import type { ApiOfficeRoom, RoomPoint } from "@galadrim-tools/shared";

import {
    getCanvasCoordinates,
    getDbCoordinates,
    isPointInPolygon,
} from "@/features/visuel/utils/coordinates";
import { useElementSize } from "@/features/visuel/utils/useElementSize";

import type { DraftRoom } from "./types";

const ASPECT_RATIO = 1980 / 1080;

const MIN_CANVAS_WIDTH = 420;
const MAX_CANVAS_WIDTH = 1100;
const DEFAULT_CANVAS_WIDTH = 900;

const ROOM_FILL_UNBOOKABLE = "rgba(148,163,184,0.10)";
const ROOM_FILL_SELECTED = "rgba(59,130,246,0.24)";
const ROOM_FILL_HOVERED = "rgba(59,130,246,0.14)";
const ROOM_FILL_DEFAULT = "rgba(148,163,184,0.08)";

const ROOM_STROKE_SELECTED = "rgba(59,130,246,0.85)";
const ROOM_STROKE_HOVERED = "rgba(59,130,246,0.55)";
const ROOM_STROKE_DEFAULT = "rgba(148,163,184,0.35)";

function getRoomCanvasStyles(opts: {
    isBookable: boolean;
    isSelected: boolean;
    isHovered: boolean;
}) {
    if (!opts.isBookable) {
        return { fill: ROOM_FILL_UNBOOKABLE, stroke: ROOM_STROKE_DEFAULT };
    }

    if (opts.isSelected) {
        return { fill: ROOM_FILL_SELECTED, stroke: ROOM_STROKE_SELECTED };
    }

    if (opts.isHovered) {
        return { fill: ROOM_FILL_HOVERED, stroke: ROOM_STROKE_HOVERED };
    }

    return { fill: ROOM_FILL_DEFAULT, stroke: ROOM_STROKE_DEFAULT };
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

export default function MapEditorCanvas(props: {
    rooms: ApiOfficeRoom[];
    selectedRoom: DraftRoom | null;
    selectedPointIndex: number | null;
    setSelectedPointIndex: (idx: number | null) => void;
    hoveredRoomId: number | null;
    setHoveredRoomId: (id: number | null) => void;
    onSelectRoom: (roomId: number) => void;
    onAddPointToSelectedRoom: (point: RoomPoint) => void;
    onMovePointInSelectedRoom: (idx: number, point: RoomPoint) => void;
    onCreateRoomAtPoint: (canvas: HTMLCanvasElement, point: RoomPoint) => void;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { width: wrapperWidth } = useElementSize(wrapperRef);

    const canvasWidth = useMemo(() => {
        const target = Math.min(
            MAX_CANVAS_WIDTH,
            Math.max(MIN_CANVAS_WIDTH, Math.floor(wrapperWidth || DEFAULT_CANVAS_WIDTH)),
        );
        return target;
    }, [wrapperWidth]);

    const canvasHeight = useMemo(() => {
        return Math.floor(canvasWidth / ASPECT_RATIO);
    }, [canvasWidth]);

    const roomsForRender = useMemo(() => {
        if (!props.selectedRoom) return props.rooms;
        return props.rooms.map((r) =>
            r.id === props.selectedRoom?.id ? { ...r, ...props.selectedRoom } : r,
        );
    }, [props.rooms, props.selectedRoom]);

    const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);

    const getCanvasPointFromEvent = (
        event: { clientX: number; clientY: number },
        canvas: HTMLCanvasElement,
    ) => {
        const rect = canvas.getBoundingClientRect();

        const scaleX = rect.width ? canvas.width / rect.width : 1;
        const scaleY = rect.height ? canvas.height / rect.height : 1;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        return { x, y };
    };

    const findClosestPointIndex = (
        canvasPoint: { x: number; y: number },
        canvas: HTMLCanvasElement,
    ) => {
        if (!props.selectedRoom) return null;

        const threshold = 10;
        const thresholdSq = threshold * threshold;

        let bestIndex: number | null = null;
        let bestDistSq = Number.POSITIVE_INFINITY;

        const points = props.selectedRoom.config.points;
        for (let i = 0; i < points.length; i++) {
            const ptDb = points[i];
            if (!ptDb) continue;
            const ptCanvas = getCanvasCoordinates(ptDb, canvas);
            const dx = ptCanvas.x - canvasPoint.x;
            const dy = ptCanvas.y - canvasPoint.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= thresholdSq && distSq < bestDistSq) {
                bestIndex = i;
                bestDistSq = distSq;
            }
        }

        return bestIndex;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for (const room of roomsForRender) {
            const polygon = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
            if (polygon.length < 3) continue;

            const isSelected = props.selectedRoom?.id === room.id;
            const isHovered = props.hoveredRoomId === room.id;

            const { fill, stroke } = getRoomCanvasStyles({
                isBookable: room.isBookable,
                isSelected,
                isHovered,
            });

            ctx.beginPath();
            polygon.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();

            ctx.fillStyle = fill;
            ctx.fill();

            ctx.strokeStyle = stroke;
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
        }

        if (props.selectedRoom) {
            const points = props.selectedRoom.config.points;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                if (!point) continue;
                const pt = getCanvasCoordinates(point, canvas);
                const isSelectedPoint = props.selectedPointIndex === i;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, isSelectedPoint ? 5 : 3, 0, Math.PI * 2);
                ctx.closePath();

                ctx.fillStyle = isSelectedPoint ? "rgba(59,130,246,1)" : "rgba(59,130,246,0.9)";
                ctx.fill();

                if (isSelectedPoint) {
                    ctx.strokeStyle = "rgba(255,255,255,0.9)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.lineWidth = 1;
                }
            }
        }
    }, [
        canvasHeight,
        canvasWidth,
        props.hoveredRoomId,
        props.selectedPointIndex,
        props.selectedRoom,
        roomsForRender,
    ]);

    return (
        <div ref={wrapperRef} className="w-full">
            <canvas
                ref={(el) => {
                    canvasRef.current = el;
                    props.onCanvasReady?.(el);
                }}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full touch-none rounded-md border border-border/60 bg-background"
                onPointerMove={(event) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const { x, y } = getCanvasPointFromEvent(event, canvas);

                    if (draggingPointIndex !== null && props.selectedRoom) {
                        const point = getDbCoordinates({ x, y }, canvas);
                        props.onMovePointInSelectedRoom(draggingPointIndex, point);
                        canvas.style.cursor = "grabbing";
                        return;
                    }

                    if (props.selectedRoom) {
                        props.setHoveredRoomId(null);
                        const pointIdx = findClosestPointIndex({ x, y }, canvas);
                        canvas.style.cursor = pointIdx !== null ? "grab" : "crosshair";
                        return;
                    }

                    const hovered = getRoomAtPoint(roomsForRender, { x, y }, canvas);
                    props.setHoveredRoomId(hovered?.id ?? null);
                    canvas.style.cursor = hovered ? "pointer" : "default";
                }}
                onPointerLeave={() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    if (!props.selectedRoom) props.setHoveredRoomId(null);
                    if (draggingPointIndex === null) canvas.style.cursor = "default";
                }}
                onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const { x, y } = getCanvasPointFromEvent(event, canvas);

                    if (props.selectedRoom) {
                        const pointIdx = findClosestPointIndex({ x, y }, canvas);
                        if (pointIdx !== null) {
                            props.setSelectedPointIndex(pointIdx);
                            setDraggingPointIndex(pointIdx);
                            canvas.setPointerCapture(event.pointerId);
                            event.preventDefault();
                            return;
                        }

                        const point = getDbCoordinates({ x, y }, canvas);
                        if (props.selectedPointIndex !== null) {
                            props.onMovePointInSelectedRoom(props.selectedPointIndex, point);
                            return;
                        }

                        props.onAddPointToSelectedRoom(point);
                        return;
                    }

                    const clicked = getRoomAtPoint(roomsForRender, { x, y }, canvas);
                    if (!clicked) return;
                    props.onSelectRoom(clicked.id);
                }}
                onPointerUp={(event) => {
                    if (draggingPointIndex === null) return;

                    const canvas = canvasRef.current;
                    if (canvas) {
                        try {
                            canvas.releasePointerCapture(event.pointerId);
                        } catch {
                            // releasePointerCapture can throw in some browsers
                        }
                    }

                    setDraggingPointIndex(null);
                }}
                onPointerCancel={(event) => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                        try {
                            canvas.releasePointerCapture(event.pointerId);
                        } catch {
                            // releasePointerCapture can throw in some browsers
                        }
                    }

                    setDraggingPointIndex(null);
                }}
                onContextMenu={(event) => {
                    event.preventDefault();
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const { x, y } = getCanvasPointFromEvent(event, canvas);
                    props.onCreateRoomAtPoint(canvas, { x, y });
                }}
            />
        </div>
    );
}
