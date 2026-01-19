import type { RoomPoint } from "@galadrim-tools/shared";

export type DraftRoom = {
    id: number;
    officeFloorId: number;
    name: string;
    isBookable: boolean;
    isPhonebox: boolean;
    hasTv: boolean;
    config: { points: RoomPoint[] };
    pointIds: string[];
};
