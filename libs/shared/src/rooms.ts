import type { ModelBase } from "./api_types";

export type OfficeFloorConfig = unknown;

export interface RoomPoint {
    x: number;
    y: number;
}

export interface OfficeRoomConfig {
    points: RoomPoint[];
}

export interface ApiOffice extends ModelBase {
    name: string;
    address: string;
    lat: number;
    lng: number;
}

export interface ApiOfficeFloor extends ModelBase {
    officeId: number;
    floor: number;
    config: OfficeFloorConfig;
}

export interface ApiOfficeRoom extends ModelBase {
    officeFloorId: number;
    name: string;
    isBookable: boolean;
    isPhonebox: boolean;
    config: OfficeRoomConfig;
}
export interface ApiRoomReservation extends ModelBase {
    officeRoomId: number;
    title: string | null;
    titleComputed: string;
    start: string;
    end: string;
    userId: number;
}
