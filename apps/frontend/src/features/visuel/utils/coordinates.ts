import type { RoomPoint } from "@galadrim-tools/shared";

const BASE_WIDTH = 1980;
const BASE_HEIGHT = 1080;

function getWidthHeightRatio(canvas: HTMLCanvasElement) {
    const widthRatio = canvas.width / BASE_WIDTH;
    const heightRatio = canvas.height / BASE_HEIGHT;
    return { widthRatio, heightRatio };
}

export function getCanvasCoordinates(point: RoomPoint, canvas: HTMLCanvasElement) {
    const { widthRatio, heightRatio } = getWidthHeightRatio(canvas);
    return {
        x: Math.floor(point.x * widthRatio),
        y: Math.floor(point.y * heightRatio),
    };
}

export function getDbCoordinates(point: RoomPoint, canvas: HTMLCanvasElement) {
    const { widthRatio, heightRatio } = getWidthHeightRatio(canvas);

    return {
        x: Math.floor(point.x / widthRatio),
        y: Math.floor(point.y / heightRatio),
    };
}

export function isPointInPolygon(point: RoomPoint, polygon: RoomPoint[]): boolean {
    let inside = false;
    const numPoints = polygon.length;

    for (let i = 0, j = numPoints - 1; i < numPoints; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        const intersect =
            yi > point.y !== yj > point.y &&
            point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

        if (intersect) inside = !inside;
    }

    return inside;
}
