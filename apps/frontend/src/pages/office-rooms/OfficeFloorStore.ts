import type { ApiOfficeRoom, ApiRoomReservation, RoomPoint } from "@galadrim-tools/shared";
import { action, makeObservable, observable } from "mobx";
import { themeColors } from "../../theme";
import { getCanvasCoordinates, isPointInPolygon } from "./coordinatesHelper";

export class OfficeFloorStore {
    protected canvas: HTMLCanvasElement | null = null;
    protected ctx: CanvasRenderingContext2D | null = null;
    protected animationFrame: number | null = null;
    protected rooms: ApiOfficeRoom[] = [];
    protected reservations: ApiRoomReservation[] = [];
    selectedRoom: ApiOfficeRoom | null = null;
    protected mousePosition: RoomPoint = { x: 0, y: 0 };
    protected searchText = "";

    constructor() {
        makeObservable(this, { selectedRoom: observable, setSelectedRoom: action });
    }

    setup(canvas: HTMLCanvasElement | null) {
        this.canvas = canvas;
        this.ctx = canvas?.getContext("2d") ?? null;

        if (this.ctx) {
            this.animationFrame = window.requestAnimationFrame(this.draw.bind(this));
        } else if (this.animationFrame) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    setRooms(rooms: ApiOfficeRoom[]) {
        this.rooms = rooms;
    }

    setSelectedRoom(selectedRoom: ApiOfficeRoom | null) {
        this.selectedRoom = selectedRoom;
    }

    setReservations(reservations: ApiRoomReservation[]) {
        this.reservations = reservations;
    }

    draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawRooms();

        this.animationFrame = window.requestAnimationFrame(this.draw.bind(this));
    }

    drawRooms() {
        this.rooms.forEach((room) => {
            const strokeStyle = this.isSearched(room) ? themeColors.highligh.main : undefined;
            if (room.id === this.selectedRoom?.id) {
                this.drawRoom(this.selectedRoom, themeColors.highligh.main);
            } else if (this.isRoomReserved(room)) {
                this.drawRoom(room, themeColors.error.main, strokeStyle);
            } else if (room.id === this.roomHovered?.id) {
                this.drawRoom(room, themeColors.secondary.dark, strokeStyle);
            } else {
                this.drawRoom(room, themeColors.secondary.main, strokeStyle);
            }
        });
    }

    drawRoom(room: ApiOfficeRoom, fillStyle: string, strokeStyle?: string) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        if (!ctx || !canvas || room.config.points.length < 3) return;
        const roomPoints = room.config.points.map((point) => getCanvasCoordinates(point, canvas));

        ctx.fillStyle = fillStyle;

        ctx.beginPath();
        roomPoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.lineTo(roomPoints[0].x, roomPoints[0].y);
        ctx.fill();

        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }

        ctx.closePath();
    }

    isSearched(room: ApiOfficeRoom) {
        if (this.searchText === "") return false;
        return room.name.toLowerCase().includes(this.searchText.toLowerCase());
    }

    isRoomReserved(room: ApiOfficeRoom, now = new Date()) {
        return this.reservations.some(
            (r) => r.officeRoomId === room.id && new Date(r.start) < now && now < new Date(r.end),
        );
    }

    setMousePosition(x: number, y: number) {
        if (!this.canvas) return;
        this.mousePosition = { x, y };
    }

    get roomHovered() {
        return this.rooms.find((room) => this.isPointInRoom(room, this.mousePosition)) ?? null;
    }

    isPointInRoom(room: ApiOfficeRoom, pointInCanvasCoordinates: RoomPoint): boolean {
        const canvas = this.canvas;
        if (!canvas) return false;
        const roomPoints = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
        const isInside = isPointInPolygon(pointInCanvasCoordinates, roomPoints);

        return isInside;
    }

    setSearchText(searchText: string) {
        this.searchText = searchText;
    }
}
