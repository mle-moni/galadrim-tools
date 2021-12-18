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
            p1: { x: 0, y: 320 },
            p2: { x: 0, y: 360 }, // p2.x is set with image width
        },
    },
    {
        name: 'Salle Vador',
        rect: {
            p1: { x: 16, y: 426 },
            p2: { x: 121, y: 629 },
        },
    },
    {
        name: 'Salle Adier',
        rect: {
            p1: { x: 126, y: 418 },
            p2: { x: 267, y: 546 },
        },
    },
    {
        name: 'Salle Turing',
        rect: {
            p1: { x: 539, y: 430 },
            p2: { x: 654, y: 549 },
        },
    },
    {
        name: 'Salle manguier massif',
        rect: {
            p1: { x: 667, y: 430 },
            p2: { x: 764, y: 556 },
        },
    },
    {
        name: 'Salle babyfoot',
        rect: {
            p1: { x: 821, y: 550 },
            p2: { x: 962, y: 648 },
        },
    },
    {
        name: 'Salle du coffre',
        rect: {
            p1: { x: 514, y: 672 },
            p2: { x: 574, y: 827 },
        },
    },
    {
        name: 'Cuisine',
        rect: {
            p1: { x: 220, y: 49 },
            p2: { x: 354, y: 188 },
        },
    },
]

export function isColliding(p: Point, rect: Rect) {
    return p.x > rect.p1.x && p.x < rect.p2.x && p.y > rect.p1.y && p.y < rect.p2.y
}
