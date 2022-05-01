import { WorkplaceSvgRoom } from '../components/WorkplaceSvg/WorkplaceSvg'

export const RESERVABLE_ROOMS = [
    'Adier',
    'Babyfoot',
    'Coffre',
    'Kitchen',
    'Manguier',
    'Turing',
    'Vador',
] as const

export type ReservableWorkplaceSvgRoom = typeof RESERVABLE_ROOMS[number]

export type RoomFullName = typeof AllRooms[number]['name']

export const AllRooms = [
    {
        name: '*',
    },
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
        name: 'Salle babyfoot',
    },
    {
        name: 'Salle du coffre',
    },
    {
        name: 'Cuisine',
    },
] as const

const WorkplaceSvgRoomToFullRoomName: { [K in ReservableWorkplaceSvgRoom]: RoomFullName } = {
    Adier: 'Salle Adier',
    Babyfoot: 'Salle babyfoot',
    Coffre: 'Salle du coffre',
    Kitchen: 'Cuisine',
    Manguier: 'Salle manguier massif',
    Vador: 'Salle Vador',
    Turing: 'Salle Turing',
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
