import type { ApiOfficeRoom } from "@galadrim-tools/shared";

export class OfficeFloorStore {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private animationFrame: number | null = null;
    private rooms: ApiOfficeRoom[] = [];
    private selectedRoom: ApiOfficeRoom | null = null;

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
            this.drawRoom(this.selectedRoom, "#f00");
        }

        this.animationFrame = window.requestAnimationFrame(this.draw.bind(this));
    }

    drawRooms() {
        this.rooms.forEach((room) => this.drawRoom(room));
    }

    drawRoom(rawRoom: ApiOfficeRoom, fillStyle = "#00f") {
        if (!this.ctx || !this.canvas) return;
        const roomConfig = getApiOfficeRoomConfig(rawRoom, this.canvas);

        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(roomConfig.x, roomConfig.y, roomConfig.width, roomConfig.height);
    }
}

/**
 * transform the positions / dimensions of the room to fit the canvas
 * positions are given as 1980x1080 pixels
 * but canvas can be any size with the same ratio (16:9)
 * so we need to scale the room config to fit the canvas
 */
const getApiOfficeRoomConfig = (room: ApiOfficeRoom, canvas: HTMLCanvasElement) => {
    const baseWidth = 1980;
    const baseHeight = 1080;
    const actualWidth = canvas.width;
    const actualHeight = canvas.height;

    const widthRatio = actualWidth / baseWidth;
    const heightRatio = actualHeight / baseHeight;

    const roomWidth = room.config.width * widthRatio;
    const roomHeight = room.config.height * heightRatio;

    const x = room.config.x * widthRatio;
    const y = room.config.y * heightRatio;

    return {
        ...room.config,
        width: roomWidth,
        height: roomHeight,
        x,
        y,
    };
};
