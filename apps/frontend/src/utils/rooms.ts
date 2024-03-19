import { WorkplaceSvgRoom } from '../reusableComponents/WorkplaceSvg/WorkplaceSvg'

export const RESERVABLE_ROOMS = [
    'Adier',
    'Coffre',
    'Kitchen',
    'Manguier',
    'Turing',
    'Vador',
    'Cube',
    'Arche',
    'Nantes_Boudoir',
    'Nantes_Moquette',
    'Nantes_Cave',
    'Nantes_Placard'
] as const

export type ReservableWorkplaceSvgRoom = typeof RESERVABLE_ROOMS[number]

export type RoomFullName = typeof AllRooms[number]['name']

export const ParisRooms = [
    {
        name: 'Salle Vador',
    },
    {
        name: 'Salle Adier',
    },
    {
        name: 'Salle Turing',
    },
    {
        name: 'Salle manguier massif',
    },
    {
        name: 'Salle du coffre',
    },
    {
        name: 'Cuisine',
    },
    {
        name: 'Le Cube',
    },
    {
        name: "L'Arche",
    },
] as const

export const NantesRooms = [
    {
        name: "Nantes - Le boudoir",
    },
    {
        name: "Nantes - La moquette",
    },
    {
        name: "Nantes - La cave",
    },
    {
        name: "Nantes - Le placard",
    }
] as const

export const AllRooms = [
    {
        name: '*',
    },
    ...ParisRooms,
    ...NantesRooms,
] as const

const WorkplaceSvgRoomToFullRoomName: {
    [K in ReservableWorkplaceSvgRoom]: RoomFullName
} = {
    Adier: 'Salle Adier',
    Coffre: 'Salle du coffre',
    Kitchen: 'Cuisine',
    Manguier: 'Salle manguier massif',
    Vador: 'Salle Vador',
    Turing: 'Salle Turing',
    Cube: 'Le Cube',
    Arche: "L'Arche",
    Nantes_Boudoir: "Nantes - Le boudoir",
    Nantes_Cave: "Nantes - La cave",
    Nantes_Moquette: "Nantes - La moquette",
    Nantes_Placard: "Nantes - Le placard",
}

export function isReservableRoom(room: WorkplaceSvgRoom): room is ReservableWorkplaceSvgRoom {
    return RESERVABLE_ROOMS.includes(room as ReservableWorkplaceSvgRoom)
}

export function getReservableRoomFullName(room: WorkplaceSvgRoom) {
    if (!isReservableRoom(room)) {
        return null
    }
    return WorkplaceSvgRoomToFullRoomName[room]
}
