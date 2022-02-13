import { makeAutoObservable } from 'mobx'
import { WorkplaceSvgRoom } from '../components/WorkplaceSvg/WorkplaceSvg'
import { AppStore } from '../stores/AppStore'
import { themeColors } from '../theme'
import { getReservableRoomFullName } from '../utils/rooms'

const SVG_RENDER_LOOP_TIME = 1000

export class HomePageStore {
    public keyId = 0

    intervalId: number

    constructor() {
        makeAutoObservable(this)

        this.intervalId = setInterval(() => {
            this.incrementKey()
        }, SVG_RENDER_LOOP_TIME)
    }

    cleanup() {
        clearInterval(this.intervalId)
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
        if (!AppStore.eventsStore.roomIsAvailable(roomFullName, new Date())) {
            return themeColors.error.main
        }
        return themeColors.secondary.dark
    }

    incrementKey() {
        ++this.keyId
    }

    get svgKey() {
        return `svg-key${this.keyId}`
    }
}
