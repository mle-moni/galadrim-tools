import type { ApiOffice, ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OfficeFloorStore } from "./OfficeFloorStore";
import { useCanvasSize } from "./useCanvasSize";

const officeFloorStore = new OfficeFloorStore();

interface Params {
    selectedRoom: ApiOfficeRoom | null;
    rooms: ApiOfficeRoom[];
    selectedOfficeFloor: ApiOfficeFloor;
    selectedOffice: ApiOffice;
}

export const ShowOfficeFloor = observer(
    ({ rooms, selectedRoom, selectedOfficeFloor, selectedOffice }: Params) => {
        const navigate = useNavigate();
        const { canvasWidth, canvasHeight } = useCanvasSize();
        const [roomHoveredName, setRoomHoveredName] = useState<string | null>(null);

        useEffect(() => {
            officeFloorStore.setRooms(rooms);
        }, [rooms]);

        useEffect(() => {
            officeFloorStore.setSelectedRoom(selectedRoom);
        }, [selectedRoom]);

        return (
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                }}
            >
                <Typography style={{ fontSize: 26, userSelect: "none" }}>
                    Étage {selectedOfficeFloor.floor}
                </Typography>
                <canvas
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
                {officeFloorStore.roomHovered && (
                    <Typography style={{ fontSize: 26, userSelect: "none" }}>
                        {roomHoveredName}
                    </Typography>
                )}
            </div>
        );
    },
);
