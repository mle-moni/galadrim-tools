import type { RoomPoint } from "@galadrim-tools/shared";
import { OfficeFloorStore } from "../OfficeFloorStore";

export class OfficeFloorStoreAdmin extends OfficeFloorStore {
    addPoint(dbPoint: RoomPoint) {
        if (!this.selectedRoom) return;

        this.selectedRoom.config.points.push(dbPoint);
    }
}
