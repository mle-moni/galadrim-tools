import { makeAutoObservable } from 'mobx'
import { WorkplaceSvgRoom } from '../components/WorkplaceSvg/WorkplaceSvg'
import { AppStore } from '../stores/AppStore'
import { themeColors } from '../theme'
import { getReservableRoomFullName } from '../utils/rooms'

export class HomePageStore {
    constructor() {
        makeAutoObservable(this)
    }

    onClick(room: WorkplaceSvgRoom) {
        const roomFullName = getReservableRoomFullName(room)
        if (roomFullName !== null) {
            AppStore.navigate('/room/' + roomFullName)
        }
    }

    getRoomColor(room: WorkplaceSvgRoom) {
        const roomFullName = getReservableRoomFullName(room)
        if (roomFullName === null) {
            return themeColors.secondary.dark
        }
        if (AppStore.eventsStore.roomIsAvailable(roomFullName, new Date())) {
            return themeColors.secondary.main
        }
        return themeColors.error.main
    }

    getRoomMouseOverColor(room: WorkplaceSvgRoom) {
        const roomFullName = getReservableRoomFullName(room)
        if (roomFullName === null) {
            return themeColors.secondary.dark
        }
        return themeColors.secondary.dark
    }
}
