export type Point = { x: number; y: number }

export type Rect = { p1: Point; p2: Point }

export type Room = {
    name: string
    rect: Rect
}

export const AllRooms: Room[] = [
    {
        name: '*',
        rect: {
            p1: { x: 0, y: 10 },
            p2: { x: 0, y: 50 }, // p2.x is set with image width
        }
    },
    {
        name: 'Salle de repos',
        rect: {
            p1: { x: 8, y: 166 },
            p2: { x: 97, y: 257 },
        },
    },
    {
        name: 'Salle à manger',
        rect: {
            p1: { x: 99, y: 152 },
            p2: { x: 222, y: 248 },
        },
    },
    {
        name: 'Salle réunion 1',
        rect: {
            p1: { x: 418, y: 131 },
            p2: { x: 513, y: 215 },
        },
    },
    {
        name: 'Salle réunion 2',
        rect: {
            p1: { x: 520, y: 123 },
            p2: { x: 587, y: 204 },
        },
    },
    {
        name: 'Salle de jeux',
        rect: {
            p1: { x: 609, y: 177 },
            p2: { x: 732, y: 282 },
        },
    },
]

export function isColliding(p: Point, rect: Rect) {
    return p.x > rect.p1.x && p.x < rect.p2.x && p.y > rect.p1.y && p.y < rect.p2.y
}
