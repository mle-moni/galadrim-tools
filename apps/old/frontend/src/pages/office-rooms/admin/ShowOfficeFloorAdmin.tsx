import type {
    ApiOffice,
    ApiOfficeFloor,
    ApiOfficeRoom,
    ApiRoomReservation,
} from "@galadrim-tools/shared";
import { Box, Button, Checkbox, Chip } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDbCoordinates } from "../coordinatesHelper";
import { useCanvasSize } from "../useCanvasSize";
import { OfficeFloorStoreAdmin } from "./OfficeFloorStoreAdmin";
import {
    useOfficeRoomCreateMutation,
    useOfficeRoomDeleteMutation,
    useOfficeRoomUpdateMutation,
} from "./officeRoomMutations";

interface Params {
    selectedRoom: ApiOfficeRoom | null;
    rooms: ApiOfficeRoom[];
    reservations: ApiRoomReservation[];
    selectedOfficeFloor: ApiOfficeFloor;
    selectedOffice: ApiOffice;
    numberOfFloors?: number;
    searchText: string;
    offsetHeight?: number;
}

export const ShowOfficeFloorAdmin = observer(
    ({
        rooms,
        selectedRoom,
        selectedOfficeFloor,
        selectedOffice,
        numberOfFloors = 1,
        searchText,
        offsetHeight = 0,
        reservations,
    }: Params) => {
        const roomIdsSet = useMemo(() => new Set(rooms.map((r) => r.id)), [rooms]);
        const filteredReservations = useMemo(
            () => reservations.filter((r) => roomIdsSet.has(r.officeRoomId)),
            [reservations, roomIdsSet],
        );
        const officeFloorStore = useRef(new OfficeFloorStoreAdmin()).current;
        const navigate = useNavigate();
        const { canvasWidth, canvasHeight } = useCanvasSize(numberOfFloors, offsetHeight);
        const [roomHoveredName, setRoomHoveredName] = useState<string | null>(null);
        const filteredRooms = useMemo(
            () => rooms.filter(({ officeFloorId }) => officeFloorId === selectedOfficeFloor.id),
            [rooms, selectedOfficeFloor],
        );

        const createMutation = useOfficeRoomCreateMutation();
        const updateMutation = useOfficeRoomUpdateMutation();
        const deleteMutation = useOfficeRoomDeleteMutation(() =>
            navigate(`/office-rooms/admin/${selectedOffice.id}/${selectedOfficeFloor.id}`),
        );

        useEffect(() => {
            officeFloorStore.setRooms(filteredRooms);
        }, [filteredRooms, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setSelectedRoom(selectedRoom?.id ?? null);
        }, [selectedRoom, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setSearchText(searchText);
        }, [searchText, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setReservations(filteredReservations);
        });

        const resetMousePosition = () => {
            officeFloorStore.setMousePosition(0, 0);
            setRoomHoveredName(null);
        };

        return (
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <canvas
                    onBlur={resetMousePosition}
                    onMouseOut={resetMousePosition}
                    onMouseMove={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;
                        const canvas = officeFloorStore.canvas;

                        officeFloorStore.setMousePosition(mouseX, mouseY);
                        if (officeFloorStore.roomHovered) {
                            if (canvas) canvas.style.cursor = "pointer";
                            if (officeFloorStore.roomHovered.name === roomHoveredName) return;
                            setRoomHoveredName(officeFloorStore.roomHovered.name);
                        } else {
                            if (canvas) canvas.style.cursor = "default";
                            if (roomHoveredName) setRoomHoveredName(null);
                        }
                    }}
                    onContextMenu={(event) => {
                        event.preventDefault();

                        const rect = event.currentTarget.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;

                        const p1 = getDbCoordinates({ x: mouseX, y: mouseY }, event.currentTarget);
                        const p2 = { x: p1.x + 100, y: p1.y };
                        const p3 = { x: p1.x + 100, y: p1.y + 100 };
                        const p4 = { x: p1.x, y: p1.y + 100 };

                        const newName = prompt("Nom pour la salle");
                        if (!newName) return;

                        createMutation.mutate({
                            name: newName,
                            config: JSON.stringify({
                                points: [p1, p2, p3, p4],
                            }),
                            officeFloor: selectedOfficeFloor.id,
                            isBookable: true,
                            isPhonebox: false,
                        });
                    }}
                    onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;

                        officeFloorStore.setMousePosition(mouseX, mouseY);
                        if (selectedRoom) {
                            const newPoint = getDbCoordinates(
                                { x: mouseX, y: mouseY },
                                event.currentTarget,
                            );
                            officeFloorStore.addPoint(newPoint);
                            return;
                        }

                        if (officeFloorStore.roomHovered) {
                            navigate(
                                `/office-rooms/admin/${selectedOffice.id}/${selectedOfficeFloor.id}/${officeFloorStore.roomHovered.id}`,
                            );
                        }
                    }}
                    style={{
                        borderRadius: 4,
                        borderStyle: "solid",
                        borderWidth: 1,
                        borderColor: "black",
                    }}
                    ref={(e) => {
                        officeFloorStore.setup(e);
                    }}
                    width={canvasWidth}
                    height={canvasHeight}
                >
                    Utilisez un navigateur récent pour afficher ce contenu. Chrome c'est parfait.
                </canvas>
                {officeFloorStore.selectedRoom && (
                    <>
                        <Box>
                            <Checkbox
                                checked={officeFloorStore.selectedRoom.isBookable}
                                onChange={(_e, checked) => officeFloorStore.setIsBookable(checked)}
                            />
                            {officeFloorStore.selectedRoom?.config.points.map((p, index) => (
                                <Chip
                                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                    key={index}
                                    label={`${p.x},${p.y}`}
                                    onDelete={() => officeFloorStore.deletePoint(index)}
                                />
                            ))}
                            <Checkbox
                                checked={officeFloorStore.selectedRoom.isPhonebox}
                                onChange={(_e, checked) => officeFloorStore.setIsPhonebox(checked)}
                            />
                        </Box>
                        <Box>
                            <Button
                                onClick={() => {
                                    if (!officeFloorStore.selectedRoom) return;

                                    updateMutation.mutate({
                                        id: officeFloorStore.selectedRoom.id,
                                        name: officeFloorStore.selectedRoom.name,
                                        config: JSON.stringify(
                                            officeFloorStore.selectedRoom.config,
                                        ),
                                        officeFloor: selectedOfficeFloor.id,
                                        isBookable: officeFloorStore.selectedRoom.isBookable,
                                        isPhonebox: officeFloorStore.selectedRoom.isPhonebox,
                                    });
                                }}
                                disabled={updateMutation.isPending}
                            >
                                Sauvegarder
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!officeFloorStore.selectedRoom) return;
                                    if (!confirm("Êtes-vous sûr de vouloir supprimer la salle ?")) {
                                        return;
                                    }

                                    deleteMutation.mutate(officeFloorStore.selectedRoom.id);
                                }}
                                disabled={deleteMutation.isPending}
                            >
                                Supprimer
                            </Button>
                        </Box>
                    </>
                )}
            </div>
        );
    },
);
