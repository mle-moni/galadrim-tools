import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom, RoomPoint } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
    officeFloorsQueryOptions,
    officeRoomsQueryOptions,
    officesQueryOptions,
} from "@/integrations/backend/offices";
import { queryKeys } from "@/integrations/backend/query-keys";
import {
    createOfficeRoom,
    deleteOfficeRoom,
    updateOfficeRoom,
} from "@/integrations/backend/officeRoomsAdmin";

import {
    getCanvasCoordinates,
    getDbCoordinates,
    isPointInPolygon,
} from "@/features/visuel/utils/coordinates";
import { useElementSize } from "@/features/visuel/utils/useElementSize";

const ASPECT_RATIO = 1980 / 1080;

const MIN_CANVAS_WIDTH = 420;
const MAX_CANVAS_WIDTH = 1100;
const DEFAULT_CANVAS_WIDTH = 900;

const DEFAULT_NEW_ROOM_SIZE = 100;

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

function makeDefaultRoomPolygon(originInDbCoords: RoomPoint): { points: RoomPoint[] } {
    const p1 = originInDbCoords;
    const size = DEFAULT_NEW_ROOM_SIZE;

    const p2 = { x: p1.x + size, y: p1.y };
    const p3 = { x: p1.x + size, y: p1.y + size };
    const p4 = { x: p1.x, y: p1.y + size };
    return { points: [p1, p2, p3, p4] };
}

type DraftRoom = {
    id: number;
    officeFloorId: number;
    name: string;
    isBookable: boolean;
    isPhonebox: boolean;
    config: { points: RoomPoint[] };
};

function cloneRoom(room: ApiOfficeRoom): DraftRoom {
    return {
        id: room.id,
        officeFloorId: room.officeFloorId,
        name: room.name,
        isBookable: room.isBookable,
        isPhonebox: room.isPhonebox,
        config: { points: room.config.points.map((p) => ({ x: p.x, y: p.y })) },
    };
}

function MapEditorCanvas(props: {
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

        for (let i = 0; i < props.selectedRoom.config.points.length; i++) {
            const ptDb = props.selectedRoom.config.points[i]!;
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
                const point = points[i]!;
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

function SelectRow(props: {
    offices: ApiOffice[];
    floors: ApiOfficeFloor[];
    rooms: ApiOfficeRoom[];
    selectedOfficeId: number | "";
    selectedFloorId: number | "";
    selectedRoomId: number | "";
    onOfficeChange: (id: number | "") => void;
    onFloorChange: (id: number | "") => void;
    onRoomChange: (id: number | "") => void;
}) {
    const selectClassName =
        "border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]";

    return (
        <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
                <Label htmlFor="admin-map-office">Bureau</Label>
                <select
                    id="admin-map-office"
                    className={selectClassName}
                    value={props.selectedOfficeId}
                    onChange={(e) => {
                        props.onOfficeChange(e.target.value === "" ? "" : Number(e.target.value));
                    }}
                >
                    <option value="" disabled>
                        Sélectionner…
                    </option>
                    {props.offices
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="admin-map-floor">Étage</Label>
                <select
                    id="admin-map-floor"
                    className={selectClassName}
                    value={props.selectedFloorId}
                    disabled={props.selectedOfficeId === ""}
                    onChange={(e) => {
                        props.onFloorChange(e.target.value === "" ? "" : Number(e.target.value));
                    }}
                >
                    <option value="" disabled>
                        Sélectionner…
                    </option>
                    {props.floors
                        .slice()
                        .sort((a, b) => a.floor - b.floor)
                        .map((f) => (
                            <option key={f.id} value={f.id}>
                                {`Étage ${f.floor}`}
                            </option>
                        ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="admin-map-room">Salle</Label>
                <select
                    id="admin-map-room"
                    className={selectClassName}
                    value={props.selectedRoomId}
                    disabled={props.selectedFloorId === ""}
                    onChange={(e) => {
                        props.onRoomChange(e.target.value === "" ? "" : Number(e.target.value));
                    }}
                >
                    <option value="">Aucune</option>
                    {props.rooms
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                </select>
            </div>
        </div>
    );
}

export default function AdminOfficeRoomsEditor() {
    const queryClient = useQueryClient();

    const officesQuery = useQuery(officesQueryOptions());
    const floorsQuery = useQuery(officeFloorsQueryOptions());
    const roomsQuery = useQuery(officeRoomsQueryOptions());

    const offices = officesQuery.data ?? [];
    const floors = floorsQuery.data ?? [];
    const rooms = roomsQuery.data ?? [];

    const [selectedOfficeId, setSelectedOfficeId] = useState<number | "">("");
    const [selectedFloorId, setSelectedFloorId] = useState<number | "">("");
    const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");

    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
    const [draftRoom, setDraftRoom] = useState<DraftRoom | null>(null);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
    const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

    const floorsForOffice = useMemo(() => {
        if (selectedOfficeId === "") return [];
        return floors.filter((f) => f.officeId === selectedOfficeId);
    }, [floors, selectedOfficeId]);

    const roomsForFloor = useMemo(() => {
        if (selectedFloorId === "") return [];
        return rooms.filter((r) => r.officeFloorId === selectedFloorId);
    }, [rooms, selectedFloorId]);

    useEffect(() => {
        if (selectedOfficeId !== "") return;
        const first = offices[0]?.id;
        if (first !== undefined) setSelectedOfficeId(first);
    }, [offices, selectedOfficeId]);

    useEffect(() => {
        if (selectedOfficeId === "") return;
        const availableFloors = floorsForOffice.slice().sort((a, b) => a.floor - b.floor);
        if (availableFloors.length === 0) {
            setSelectedFloorId("");
            return;
        }
        const stillValid = availableFloors.some((f) => f.id === selectedFloorId);
        if (!stillValid) {
            setSelectedFloorId(availableFloors[0]!.id);
        }
    }, [floorsForOffice, selectedFloorId, selectedOfficeId]);

    useEffect(() => {
        if (selectedFloorId === "") {
            setSelectedRoomId("");
            setDraftRoom(null);
            setSelectedPointIndex(null);
            return;
        }

        if (selectedRoomId === "") {
            setDraftRoom(null);
            setSelectedPointIndex(null);
            return;
        }

        const room = roomsForFloor.find((r) => r.id === selectedRoomId);
        if (!room) {
            setSelectedRoomId("");
            setDraftRoom(null);
            setSelectedPointIndex(null);
            return;
        }

        setDraftRoom(cloneRoom(room));
        setSelectedPointIndex(null);
    }, [roomsForFloor, selectedFloorId, selectedRoomId]);

    const createMutation = useMutation({
        mutationFn: createOfficeRoom,
        onSuccess: (created) => {
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) => {
                if (!old) return [created];

                const existingIndex = old.findIndex((room) => room.id === created.id);
                if (existingIndex === -1) return [created, ...old];

                const next = old.slice();
                next[existingIndex] = created;
                return next;
            });

            setSelectedRoomId(created.id);
            setSelectedPointIndex(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateOfficeRoom,
        onSuccess: (updated) => {
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) => {
                if (!old) return [updated];

                const existingIndex = old.findIndex((room) => room.id === updated.id);
                if (existingIndex === -1) return [updated, ...old];

                const next = old.slice();
                next[existingIndex] = updated;
                return next;
            });

            setDraftRoom(cloneRoom(updated));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOfficeRoom,
        onSuccess: (data) => {
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) => {
                if (!old) return old;
                return old.filter((room) => room.id !== data.id);
            });

            setSelectedRoomId("");
            setDraftRoom(null);
            setSelectedPointIndex(null);
        },
    });

    const selectedOffice =
        selectedOfficeId === "" ? null : offices.find((o) => o.id === selectedOfficeId) ?? null;

    const selectedFloor =
        selectedFloorId === "" ? null : floors.find((f) => f.id === selectedFloorId) ?? null;

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Éditeur de plan</CardTitle>
                    <CardDescription>
                        Clic droit pour créer une salle (ou bouton "Nouvelle salle"). Sélectionnez
                        une salle puis cliquez pour ajouter des points.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <SelectRow
                        offices={offices}
                        floors={floorsForOffice}
                        rooms={roomsForFloor}
                        selectedOfficeId={selectedOfficeId}
                        selectedFloorId={selectedFloorId}
                        selectedRoomId={selectedRoomId}
                        onOfficeChange={(id) => {
                            setSelectedOfficeId(id);
                            setSelectedFloorId("");
                            setSelectedRoomId("");
                            setDraftRoom(null);
                            setSelectedPointIndex(null);
                            setActiveCanvas(null);
                        }}
                        onFloorChange={(id) => {
                            setSelectedFloorId(id);
                            setSelectedRoomId("");
                            setDraftRoom(null);
                            setSelectedPointIndex(null);
                            setActiveCanvas(null);
                        }}
                        onRoomChange={(id) => {
                            setSelectedRoomId(id);
                        }}
                    />

                    <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                {selectedOffice && selectedFloor ? (
                                    <div className="text-sm font-medium text-foreground">
                                        {`${selectedOffice.name} · Étage ${selectedFloor.floor}`}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Sélectionnez un étage.
                                    </div>
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        selectedFloorId === "" ||
                                        activeCanvas === null ||
                                        createMutation.isPending
                                    }
                                    onClick={() => {
                                        if (selectedFloorId === "") return;
                                        if (!activeCanvas) return;

                                        const newName = prompt("Nom pour la salle");
                                        if (!newName) return;

                                        const origin = getDbCoordinates(
                                            {
                                                x: activeCanvas.width / 2,
                                                y: activeCanvas.height / 2,
                                            },
                                            activeCanvas,
                                        );
                                        const config = makeDefaultRoomPolygon(origin);

                                        const promise = createMutation.mutateAsync({
                                            name: newName,
                                            config: JSON.stringify(config),
                                            officeFloor: selectedFloorId,
                                            isBookable: true,
                                            isPhonebox: false,
                                        });

                                        toast.promise(promise, {
                                            loading: "Création…",
                                            success: "Salle créée",
                                            error: (error) =>
                                                error instanceof Error
                                                    ? error.message
                                                    : "Impossible de créer la salle",
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Nouvelle salle
                                </Button>
                            </div>

                            {selectedFloorId !== "" && (
                                <MapEditorCanvas
                                    rooms={roomsForFloor}
                                    selectedRoom={draftRoom}
                                    selectedPointIndex={selectedPointIndex}
                                    setSelectedPointIndex={setSelectedPointIndex}
                                    hoveredRoomId={hoveredRoomId}
                                    setHoveredRoomId={setHoveredRoomId}
                                    onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
                                    onAddPointToSelectedRoom={(point) => {
                                        setDraftRoom((prev) => {
                                            if (!prev) return prev;
                                            return {
                                                ...prev,
                                                config: {
                                                    points: [...prev.config.points, point],
                                                },
                                            };
                                        });
                                    }}
                                    onMovePointInSelectedRoom={(idx, point) => {
                                        setDraftRoom((prev) => {
                                            if (!prev) return prev;
                                            return {
                                                ...prev,
                                                config: {
                                                    points: prev.config.points.map((p, i) =>
                                                        i === idx ? point : p,
                                                    ),
                                                },
                                            };
                                        });
                                    }}
                                    onCanvasReady={setActiveCanvas}
                                    onCreateRoomAtPoint={async (canvas, pointInCanvasCoords) => {
                                        const origin = getDbCoordinates(
                                            pointInCanvasCoords,
                                            canvas,
                                        );
                                        const config = makeDefaultRoomPolygon(origin);

                                        const newName = prompt("Nom pour la salle");
                                        if (!newName) return;

                                        const promise = createMutation.mutateAsync({
                                            name: newName,
                                            config: JSON.stringify(config),
                                            officeFloor: selectedFloorId,
                                            isBookable: true,
                                            isPhonebox: false,
                                        });

                                        toast.promise(promise, {
                                            loading: "Création…",
                                            success: "Salle créée",
                                            error: (error) =>
                                                error instanceof Error
                                                    ? error.message
                                                    : "Impossible de créer la salle",
                                        });

                                        await promise.catch(() => {});
                                    }}
                                />
                            )}
                        </div>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Détails</CardTitle>
                                <CardDescription>
                                    {draftRoom
                                        ? "Modifiez puis sauvegardez."
                                        : "Sélectionnez une salle pour l'éditer."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {draftRoom ? (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="admin-map-room-name">Nom</Label>
                                            <Input
                                                id="admin-map-room-name"
                                                value={draftRoom.name}
                                                onChange={(e) =>
                                                    setDraftRoom({
                                                        ...draftRoom,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
                                            <div className="text-sm font-medium">Réservable</div>
                                            <Switch
                                                checked={draftRoom.isBookable}
                                                onCheckedChange={(checked) =>
                                                    setDraftRoom({
                                                        ...draftRoom,
                                                        isBookable: checked,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
                                            <div className="text-sm font-medium">Phonebox</div>
                                            <Switch
                                                checked={draftRoom.isPhonebox}
                                                onCheckedChange={(checked) =>
                                                    setDraftRoom({
                                                        ...draftRoom,
                                                        isPhonebox: checked,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm font-medium">Points</div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedRoomId("");
                                                        setDraftRoom(null);
                                                        setSelectedPointIndex(null);
                                                    }}
                                                >
                                                    Désélectionner
                                                </Button>
                                            </div>

                                            <div className="flex max-h-56 flex-col gap-2 overflow-auto rounded-md border border-border/60 p-2">
                                                {draftRoom.config.points.length === 0 ? (
                                                    <div className="px-1 text-xs text-muted-foreground">
                                                        Aucun point.
                                                    </div>
                                                ) : (
                                                    draftRoom.config.points.map((p, idx) => {
                                                        const isSelected =
                                                            selectedPointIndex === idx;
                                                        return (
                                                            <button
                                                                // biome-ignore lint/suspicious/noArrayIndexKey: stable ordering matters here
                                                                key={idx}
                                                                type="button"
                                                                className={`flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1 text-left hover:bg-muted/20 ${
                                                                    isSelected
                                                                        ? "border-primary/50 bg-muted/20"
                                                                        : "border-border/60 bg-muted/10"
                                                                }`}
                                                                onClick={() =>
                                                                    setSelectedPointIndex(idx)
                                                                }
                                                            >
                                                                <div className="font-mono text-xs text-muted-foreground">
                                                                    {p.x},{p.y}
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setDraftRoom((prev) => {
                                                                            if (!prev) return prev;
                                                                            return {
                                                                                ...prev,
                                                                                config: {
                                                                                    points: prev.config.points.filter(
                                                                                        (_pt, i) =>
                                                                                            i !==
                                                                                            idx,
                                                                                    ),
                                                                                },
                                                                            };
                                                                        });
                                                                        setSelectedPointIndex(
                                                                            (current) => {
                                                                                if (
                                                                                    current === null
                                                                                )
                                                                                    return null;
                                                                                if (current === idx)
                                                                                    return null;
                                                                                if (current > idx)
                                                                                    return (
                                                                                        current - 1
                                                                                    );
                                                                                return current;
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Clic sur le plan pour ajouter des points. Glissez un
                                                point (ou sélectionnez-en un puis cliquez sur le
                                                plan) pour le déplacer.
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        {roomsForFloor.length === 0
                                            ? "Aucune salle sur cet étage."
                                            : "Cliquez sur une salle (ou choisissez dans la liste)."}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                {draftRoom && (
                                    <>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (!draftRoom) return;
                                                if (
                                                    !confirm(
                                                        "Êtes-vous sûr de vouloir supprimer la salle ?",
                                                    )
                                                ) {
                                                    return;
                                                }

                                                const promise = deleteMutation.mutateAsync(
                                                    draftRoom.id,
                                                );
                                                toast.promise(promise, {
                                                    loading: "Suppression…",
                                                    success: "Salle supprimée",
                                                    error: (error) =>
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Impossible de supprimer la salle",
                                                });
                                            }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? (
                                                <RefreshCcw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                            Supprimer
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                if (!draftRoom) return;
                                                if (selectedFloorId === "") return;

                                                const promise = updateMutation.mutateAsync({
                                                    id: draftRoom.id,
                                                    name: draftRoom.name.trim(),
                                                    config: JSON.stringify(draftRoom.config),
                                                    officeFloor: selectedFloorId,
                                                    isBookable: draftRoom.isBookable,
                                                    isPhonebox: draftRoom.isPhonebox,
                                                });

                                                toast.promise(promise, {
                                                    loading: "Sauvegarde…",
                                                    success: "Sauvegardé",
                                                    error: (error) =>
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Impossible de sauvegarder",
                                                });
                                            }}
                                            disabled={
                                                updateMutation.isPending ||
                                                draftRoom.name.trim() === "" ||
                                                selectedFloorId === ""
                                            }
                                        >
                                            {updateMutation.isPending ? (
                                                <RefreshCcw className="h-4 w-4 animate-spin" />
                                            ) : null}
                                            Sauvegarder
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {(officesQuery.isError || floorsQuery.isError || roomsQuery.isError) && (
                <div className="text-sm text-muted-foreground">
                    Impossible de charger les données Adomin.
                </div>
            )}
        </div>
    );
}
