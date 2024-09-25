import type { ModelBase } from "./api_types";

export interface OfficeFloorConfig {
    width: number;
    height: number;
}

export interface OfficeRoomConfig {
    width: number;
    height: number;
    x: number;
    y: number;
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
    config: OfficeRoomConfig;
}
