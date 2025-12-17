import type {
    ApiOffice,
    ApiOfficeFloor,
    ApiOfficeRoom,
    ApiRoomReservation,
} from "@galadrim-tools/shared";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UserData } from "../../api/galadrimeurs";
import { OfficeFloorStore } from "./OfficeFloorStore";
import { useCanvasSize } from "./useCanvasSize";

interface Params {
    selectedRoom: ApiOfficeRoom | null;
    rooms: ApiOfficeRoom[];
    reservations: ApiRoomReservation[];
    selectedOfficeFloor: ApiOfficeFloor;
    selectedOffice: ApiOffice;
    numberOfFloors?: number;
    searchText: string;
    searchedUser?: UserData | null;
    offsetHeight?: number;
}

export const ShowOfficeFloor = observer(
    ({
        rooms,
        selectedRoom,
        selectedOfficeFloor,
        selectedOffice,
        numberOfFloors = 1,
        searchText,
        searchedUser = null,
        offsetHeight = 0,
        reservations,
    }: Params) => {
        const roomIdsSet = useMemo(() => new Set(rooms.map((r) => r.id)), [rooms]);
        const filteredReservations = useMemo(
            () => reservations.filter((r) => roomIdsSet.has(r.officeRoomId)),
            [reservations, roomIdsSet],
        );
        const officeFloorStore = useRef(new OfficeFloorStore()).current;
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
            officeFloorStore.setSelectedRoom(selectedRoom?.id ?? null);
        }, [selectedRoom, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setSearchText(searchText);
        }, [searchText, officeFloorStore]);

        useEffect(() => {
            officeFloorStore.setSearchedUser(searchedUser);
        }, [searchedUser, officeFloorStore]);

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
                <Typography sx={{ fontSize: 18, my: 1, userSelect: "none" }}>
                    Étage {selectedOfficeFloor.floor}
                </Typography>
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
                    onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;

                        officeFloorStore.setMousePosition(mouseX, mouseY);
                        if (!officeFloorStore.roomHovered) return;

                        if (officeFloorStore.roomHovered.id === selectedRoom?.id) {
                            navigate(
                                `/office-rooms/${selectedOffice.id}/${selectedOfficeFloor.id}`,
                            );
                        } else {
                            navigate(
                                `/office-rooms/${selectedOffice.id}/${selectedOfficeFloor.id}/${officeFloorStore.roomHovered.id}`,
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
                {officeFloorStore.roomHovered && (
                    <Typography sx={{ fontSize: 18, my: 1, userSelect: "none" }}>
                        {roomHoveredName}
                    </Typography>
                )}
            </div>
        );
    },
);
