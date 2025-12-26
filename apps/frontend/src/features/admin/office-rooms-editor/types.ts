import type { RoomPoint } from "@galadrim-tools/shared";

export type DraftRoom = {
    id: number;
    officeFloorId: number;
    name: string;
    isBookable: boolean;
    isPhonebox: boolean;
    config: { points: RoomPoint[] };
};
