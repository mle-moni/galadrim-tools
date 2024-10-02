import type { ApiOfficeFloor, ApiOfficeRoom } from "@galadrim-tools/shared";
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
            <h2>Étage {selectedOfficeFloor.floor}</h2>
            <canvas
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
