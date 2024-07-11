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
    'Nantes_Torture',
    'Nantes_Cave',
    'Nantes_Placard',
    // TODO: rajouter les vrais noms des salles
    'SaintPaul_Adaly1',
    'SaintPaul_Adaly2',
    'SaintPaul_Adaly3',
    'SaintPaul_Designer',
    'SaintPaul_Etage3_1',
    'SaintPaul_Etage3_2',
] as const

export type ReservableWorkplaceSvgRoom = typeof RESERVABLE_ROOMS[number]

export type RoomFullName = typeof AllRooms[number]['name']

export type WorkspaceLocation = 'bonneNouvelle' | 'saintPaul' | 'nantes'

export const ValidLocations = [
    'bonneNouvelle',
    'saintPaul',
    'nantes',
]

export const BonneNouvelleRooms = [
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
        name: "Nantes - La salle de torture",
    },
    {
        name: "Nantes - La cave",
    },
    {
        name: "Nantes - Le placard",
    }
] as const

// TODO: rajouter les vrais noms des salles
export const SaintPaulRooms = [
    {
        name: "Saint Paul - Salle Adaly 1",
    },
    {
        name: "Saint Paul - Salle Adaly 2",
    },
    {
        name: "Saint Paul - Salle Adaly 3",
    },
    {
        name: "Saint Paul - Salle Designer",
    },
    {
        name: "Saint Paul (3e) - Salle 1",
    },
    {
        name: "Saint Paul (3e) - Salle 2",
    }
] as const


export const AllRooms = [
    {
        name: '*',
    },
    ...BonneNouvelleRooms,
    ...NantesRooms,
    ...SaintPaulRooms,
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
    Nantes_Torture: "Nantes - La salle de torture",
    Nantes_Placard: "Nantes - Le placard",
    SaintPaul_Adaly1: "Saint Paul - Salle Adaly 1",
    SaintPaul_Adaly2: "Saint Paul - Salle Adaly 2",
    SaintPaul_Adaly3: "Saint Paul - Salle Adaly 3",
    SaintPaul_Designer: "Saint Paul - Salle Designer",
    SaintPaul_Etage3_1: "Saint Paul (3e) - Salle 1",
    SaintPaul_Etage3_2: "Saint Paul (3e) - Salle 2",
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
