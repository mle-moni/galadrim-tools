import type { ApiOfficeRoom, ApiRoomReservation, RoomPoint } from "@galadrim-tools/shared";
import { action, makeObservable, observable } from "mobx";
import type { UserData } from "../../api/galadrimeurs";
import { themeColors } from "../../theme";
import { getCanvasCoordinates, isPointInPolygon } from "./coordinatesHelper";

const DEFAULT_STROKE_STYLE = "#333333";

export class OfficeFloorStore {
    canvas: HTMLCanvasElement | null = null;
    protected ctx: CanvasRenderingContext2D | null = null;
    protected animationFrame: number | null = null;
    rooms: ApiOfficeRoom[] = [];
    protected reservations: ApiRoomReservation[] = [];
    selectedRoom: ApiOfficeRoom | null = null;
    protected mousePosition: RoomPoint = { x: 0, y: 0 };
    protected searchText = "";
    protected searchedUser: UserData | null = null;

    constructor() {
        makeObservable(this, {
            selectedRoom: observable,
            setSelectedRoom: action,
            rooms: observable,
            setRooms: action,
        });
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

    setSearchedUser(searchedUser: UserData | null) {
        this.searchedUser = searchedUser;
    }

    setSelectedRoom(selectedRoomId: number | null) {
        const found = this.rooms.find((room) => room.id === selectedRoomId);
        if (!found) return;
        this.selectedRoom = found;
    }

    setReservations(reservations: ApiRoomReservation[]) {
        this.reservations = reservations;
    }

    draw() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // if (this.isAdminPage()) {
        //     const imgPath = "/assets/images/old_floors/nantes.png";
        //     const image = new Image();
        //     image.src = imgPath;
        //     this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        // }

        this.drawRooms();

        this.animationFrame = window.requestAnimationFrame(this.draw.bind(this));
    }

    getStrokeStyle(room: ApiOfficeRoom) {
        if (this.isSearched(room)) {
            return themeColors.highligh.main;
        }

        const reservation = this.isRoomReserved(room);
        const userSearched = reservation && reservation.userId === this.searchedUser?.id;
        if (userSearched) {
            return themeColors.success.main;
        }

        return DEFAULT_STROKE_STYLE;
    }

    getFillStyle(room: ApiOfficeRoom) {
        if (!room.isBookable) {
            return "#EEEEEE";
        }
        if (room.id === this.selectedRoom?.id) {
            return themeColors.highligh.main;
        }
        if (this.isRoomReserved(room)) {
            return themeColors.error.main;
        }
        if (room.id === this.roomHovered?.id) {
            return themeColors.secondary.dark;
        }
        return themeColors.secondary.main;
    }

    drawRooms() {
        this.rooms.forEach((room) => {
            const strokeStyle = this.getStrokeStyle(room);
            const fillStyle = this.getFillStyle(room);
            // hex code to append to the fill style (ff for no transparency)
            const transparency = this.isAdminPage() ? "40" : "";

            this.drawRoom(room, fillStyle + transparency, strokeStyle);
        });
    }

    drawRoom(room: ApiOfficeRoom, fillStyle: string, strokeStyle: string) {
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

        ctx.strokeStyle = strokeStyle;
        if (strokeStyle !== DEFAULT_STROKE_STYLE) {
            ctx.lineWidth = 4;
        }
        ctx.stroke();
        ctx.closePath();
        ctx.lineWidth = 1;
    }

    isSearched(room: ApiOfficeRoom) {
        if (this.searchText === "") return false;
        return room.name.toLowerCase().includes(this.searchText.toLowerCase());
    }

    isRoomReserved(room: ApiOfficeRoom, now = new Date()) {
        return this.reservations.find(
            (r) => r.officeRoomId === room.id && new Date(r.start) < now && now < new Date(r.end),
        );
    }

    setMousePosition(x: number, y: number) {
        if (!this.canvas) return;
        this.mousePosition = { x, y };
    }

    isAdminPage() {
        return false;
    }

    get reservableRooms() {
        return this.rooms.filter((room) => room.isBookable);
    }

    get roomHovered() {
        const baseRooms = this.isAdminPage() ? this.rooms : this.reservableRooms;

        return (
            baseRooms
                .slice()
                .reverse()
                .find((room) => this.isPointInRoom(room, this.mousePosition)) ?? null
        );
    }

    isPointInRoom(room: ApiOfficeRoom, pointInCanvasCoordinates: RoomPoint): boolean {
        const canvas = this.canvas;
        if (!canvas) return false;
        const roomPoints = room.config.points.map((p) => getCanvasCoordinates(p, canvas));
        const isInside = isPointInPolygon(pointInCanvasCoordinates, roomPoints);

        return isInside;
    }

    setSearchText(searchText: string) {
        this.searchText = searchText.trim();
    }
}
