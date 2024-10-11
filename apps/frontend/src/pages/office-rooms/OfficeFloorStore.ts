import type { ApiOfficeRoom, RoomPoint } from "@galadrim-tools/shared";
import { themeColors } from "../../theme";
import { getCanvasCoordinates, isPointInPolygon } from "./coordinatesHelper";

export class OfficeFloorStore {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrame: number | null = null;
    private rooms: ApiOfficeRoom[] = [];
    private selectedRoom: ApiOfficeRoom | null = null;
    private mousePosition: RoomPoint = { x: 0, y: 0 };
    private searchText = "";

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

    draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawRooms();

        if (this.selectedRoom) {
            this.drawRoom(this.selectedRoom, themeColors.error.main);
        }

        this.animationFrame = window.requestAnimationFrame(this.draw.bind(this));
    }

    drawRooms() {
        this.rooms.forEach((room) => {
            if (this.isSearched(room)) {
                this.drawRoom(room, themeColors.error.main);
            } else if (room.id === this.roomHovered?.id) {
                this.drawRoom(room, themeColors.secondary.dark);
            } else {
                this.drawRoom(room, themeColors.secondary.main);
            }
        });
    }

    drawRoom(room: ApiOfficeRoom, fillStyle: string) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        if (!ctx || !canvas) return;
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
        ctx.fill();

        ctx.closePath();
    }

    isSearched(room: ApiOfficeRoom) {
        if (this.searchText === "") return false;
        return room.name.toLowerCase().includes(this.searchText.toLowerCase());
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
