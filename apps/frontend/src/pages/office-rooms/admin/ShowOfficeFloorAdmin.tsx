import type {
    ApiOffice,
    ApiOfficeFloor,
    ApiOfficeRoom,
    ApiRoomReservation,
} from "@galadrim-tools/shared";
import { Box, Button, Chip } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clipboardCopy } from "../../../reusableComponents/auth/WhoamiStore";
import { notifyError, notifySuccess } from "../../../utils/notification";
import { getDbCoordinates } from "../coordinatesHelper";
import { useCanvasSize } from "../useCanvasSize";
import { OfficeFloorStoreAdmin } from "./OfficeFloorStoreAdmin";

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

        useEffect(() => {
            officeFloorStore.setRooms(filteredRooms);
        }, [filteredRooms, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setSelectedRoom(selectedRoom);
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

                        officeFloorStore.setMousePosition(mouseX, mouseY);
                        if (officeFloorStore.roomHovered) {
                            if (officeFloorStore.roomHovered.name === roomHoveredName) return;
                            setRoomHoveredName(officeFloorStore.roomHovered.name);
                        } else if (roomHoveredName) {
                            setRoomHoveredName(null);
                        }
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
                        cursor: "pointer",
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
                            {officeFloorStore.selectedRoom?.config.points.map((p, index) => (
                                <Chip
                                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                    key={index}
                                    label={`${p.x},${p.y}`}
                                    onDelete={() => officeFloorStore.deletePoint(index)}
                                />
                            ))}
                        </Box>
                        <Button
                            onClick={() => {
                                clipboardCopy(
                                    JSON.stringify(officeFloorStore.selectedRoom?.config),
                                    {
                                        success: () => {
                                            notifySuccess(
                                                "Configuration copiée dans le presse papier",
                                            );
                                        },
                                        error: () => {
                                            notifyError(
                                                "Impossible de copier dans le presse papier",
                                            );
                                        },
                                    },
                                );
                            }}
                        >
                            Copy config
                        </Button>
                    </>
                )}
            </div>
        );
    },
);
