import type { RoomPoint } from "@galadrim-tools/shared";
import { action, makeObservable } from "mobx";
import { OfficeFloorStore } from "../OfficeFloorStore";

export class OfficeFloorStoreAdmin extends OfficeFloorStore {
    constructor() {
        super();
        makeObservable(this, {
            addPoint: action,
            deletePoint: action,
        });
    }

    addPoint(dbPoint: RoomPoint) {
        if (!this.selectedRoom) return;

        this.selectedRoom.config.points.push(dbPoint);
    }

    deletePoint(index: number) {
        if (!this.selectedRoom) return;

        this.selectedRoom.config.points.splice(index, 1);
    }

    setIsBookable(isBookable: boolean) {
        if (!this.selectedRoom) return;

        this.selectedRoom.isBookable = isBookable;
    }

    setIsPhonebox(isPhonebox: boolean) {
        if (!this.selectedRoom) return;

        this.selectedRoom.isPhonebox = isPhonebox;
    }

    isAdminPage(): boolean {
        return true;
    }
}
