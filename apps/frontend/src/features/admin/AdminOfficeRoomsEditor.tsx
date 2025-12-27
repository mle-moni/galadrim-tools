import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import type { ApiOfficeRoom, RoomPoint } from "@galadrim-tools/shared";

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

import { getDbCoordinates } from "@/features/visuel/utils/coordinates";
import { removeById, upsertById } from "@/lib/collections";

import MapEditorCanvas from "./office-rooms-editor/MapEditorCanvas";
import { SelectRow } from "./office-rooms-editor/SelectRow";
import type { DraftRoom } from "./office-rooms-editor/types";

const DEFAULT_NEW_ROOM_SIZE = 100;

function makeDefaultRoomPolygon(originInDbCoords: RoomPoint): { points: RoomPoint[] } {
    const p1 = originInDbCoords;
    const size = DEFAULT_NEW_ROOM_SIZE;

    const p2 = { x: p1.x + size, y: p1.y };
    const p3 = { x: p1.x + size, y: p1.y + size };
    const p4 = { x: p1.x, y: p1.y + size };
    return { points: [p1, p2, p3, p4] };
}

function generatePointId(): string {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return uuid;

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneRoom(room: ApiOfficeRoom): DraftRoom {
    const points = room.config.points.map((p) => ({ x: p.x, y: p.y }));

    return {
        id: room.id,
        officeFloorId: room.officeFloorId,
        name: room.name,
        isBookable: room.isBookable,
        isPhonebox: room.isPhonebox,
        config: { points },
        pointIds: points.map(() => generatePointId()),
    };
}

export default function AdminOfficeRoomsEditor() {
    const queryClient = useQueryClient();

    const officesQuery = useQuery(officesQueryOptions());
    const floorsQuery = useQuery(officeFloorsQueryOptions());
    const roomsQuery = useQuery(officeRoomsQueryOptions());

    const offices = officesQuery.data ?? [];
    const floors = floorsQuery.data ?? [];
    const rooms = roomsQuery.data ?? [];

    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    const [hoveredRoomId, setHoveredRoomId] = useState<number | null>(null);
    const [draftRoom, setDraftRoom] = useState<DraftRoom | null>(null);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
    const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

    const floorsForOffice = useMemo(() => {
        if (selectedOfficeId == null) return [];
        return floors.filter((f) => f.officeId === selectedOfficeId);
    }, [floors, selectedOfficeId]);

    const roomsForFloor = useMemo(() => {
        if (selectedFloorId == null) return [];
        return rooms.filter((r) => r.officeFloorId === selectedFloorId);
    }, [rooms, selectedFloorId]);

    useEffect(() => {
        if (selectedOfficeId != null) return;
        const first = offices[0]?.id;
        if (first !== undefined) setSelectedOfficeId(first);
    }, [offices, selectedOfficeId]);

    useEffect(() => {
        if (selectedOfficeId == null) return;
        const availableFloors = floorsForOffice.slice().sort((a, b) => a.floor - b.floor);
        if (availableFloors.length === 0) {
            setSelectedFloorId(null);
            return;
        }
        const stillValid = availableFloors.some((f) => f.id === selectedFloorId);
        if (!stillValid) {
            const firstFloor = availableFloors[0];
            if (firstFloor) setSelectedFloorId(firstFloor.id);
        }
    }, [floorsForOffice, selectedFloorId, selectedOfficeId]);

    useEffect(() => {
        if (selectedFloorId == null) {
            setSelectedRoomId(null);
            setDraftRoom(null);
            setSelectedPointIndex(null);
            return;
        }

        if (selectedRoomId == null) {
            setDraftRoom(null);
            setSelectedPointIndex(null);
            return;
        }

        const room = roomsForFloor.find((r) => r.id === selectedRoomId);
        if (!room) {
            setSelectedRoomId(null);
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
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) =>
                upsertById(old, created),
            );

            setSelectedRoomId(created.id);
            setSelectedPointIndex(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateOfficeRoom,
        onSuccess: (updated) => {
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) =>
                upsertById(old, updated),
            );

            setDraftRoom(cloneRoom(updated));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOfficeRoom,
        onSuccess: (data) => {
            queryClient.setQueryData<ApiOfficeRoom[]>(queryKeys.officeRooms(), (old) =>
                removeById(old, data.id),
            );

            setSelectedRoomId(null);
            setDraftRoom(null);
            setSelectedPointIndex(null);
        },
    });

    const selectedOffice =
        selectedOfficeId == null ? null : offices.find((o) => o.id === selectedOfficeId) ?? null;

    const selectedFloor =
        selectedFloorId == null ? null : floors.find((f) => f.id === selectedFloorId) ?? null;

    const resetRoomSelection = () => {
        setSelectedRoomId(null);
        setDraftRoom(null);
        setSelectedPointIndex(null);
    };

    const resetCanvasContext = () => {
        resetRoomSelection();
        setActiveCanvas(null);
    };

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
                            setSelectedFloorId(null);
                            resetCanvasContext();
                        }}
                        onFloorChange={(id) => {
                            setSelectedFloorId(id);
                            resetCanvasContext();
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
                                        selectedFloorId == null ||
                                        activeCanvas === null ||
                                        createMutation.isPending
                                    }
                                    onClick={() => {
                                        if (selectedFloorId == null) return;
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

                            {selectedFloorId != null && (
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
                                                pointIds: [...prev.pointIds, generatePointId()],
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

                                        const floorId = selectedFloorId;
                                        if (floorId == null) return;

                                        const promise = createMutation.mutateAsync({
                                            name: newName,
                                            config: JSON.stringify(config),
                                            officeFloor: floorId,
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

                                        await promise.catch((error) => {
                                            console.error(error);
                                        });
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
                                                        setSelectedRoomId(null);
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
                                                                key={draftRoom.pointIds[idx] ?? idx}
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
                                                                                pointIds:
                                                                                    prev.pointIds.filter(
                                                                                        (_id, i) =>
                                                                                            i !==
                                                                                            idx,
                                                                                    ),
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
                                                if (selectedFloorId == null) return;

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
                                                selectedFloorId == null
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
