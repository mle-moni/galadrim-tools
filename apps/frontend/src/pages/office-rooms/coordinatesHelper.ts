import type { RoomPoint } from "@galadrim-tools/shared";

/**
 * Helpers to convert coordinates from the database to the canvas and vice versa
 * In database, positions are given as 1980x1080 pixels
 * but canvas can be any size with the same ratio (16:9)
 * so we need to scale the x/y points
 */

const getWidthHeightRatio = (canvas: HTMLCanvasElement) => {
    const baseWidth = 1980;
    const baseHeight = 1080;
    const actualWidth = canvas.width;
    const actualHeight = canvas.height;

    const widthRatio = actualWidth / baseWidth;
    const heightRatio = actualHeight / baseHeight;

    return { widthRatio, heightRatio };
};

export const getCanvasCoordinates = (point: RoomPoint, canvas: HTMLCanvasElement) => {
    const { widthRatio, heightRatio } = getWidthHeightRatio(canvas);
    return {
        x: Math.floor(point.x * widthRatio),
        y: Math.floor(point.y * heightRatio),
    };
};

export const getDbCoordinates = (point: RoomPoint, canvas: HTMLCanvasElement) => {
    const { widthRatio, heightRatio } = getWidthHeightRatio(canvas);

    return {
        x: Math.floor(point.x / widthRatio),
        y: Math.floor(point.y / heightRatio),
    };
};

// Ray-casting algorithm to check if point is inside the polygon
export const isPointInPolygon = (point: RoomPoint, polygon: RoomPoint[]): boolean => {
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

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
};
