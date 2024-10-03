import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
import { Typography } from "@mui/material";
import { useEffect } from "react";
import { OfficeFloorStore } from "./OfficeFloorStore";
import { useCanvasSize } from "./useCanvasSize";

const officeFloorStore = new OfficeFloorStore();

interface Params {
    selectedRoom: ApiOfficeRoom | null;
    rooms: ApiOfficeRoom[];
    selectedOfficeFloor: ApiOfficeFloor;
}

export const ShowOfficeFloor = ({ rooms, selectedRoom, selectedOfficeFloor }: Params) => {
    const { canvasWidth, canvasHeight } = useCanvasSize();

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
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
            }}
        >
            <Typography style={{ fontSize: 26 }}>Étage {selectedOfficeFloor.floor}</Typography>
            <canvas
                onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const mouseX = event.clientX - rect.left;
                    const mouseY = event.clientY - rect.top;

                    officeFloorStore.setMousePosition(mouseX, mouseY);
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
        </div>
    );
};
