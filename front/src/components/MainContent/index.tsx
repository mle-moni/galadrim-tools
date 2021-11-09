import { observer } from 'mobx-react'
import { AppStore } from '../../stores/AppStore'
import { Login } from '../auth/Login'
import { RoomCalendar } from '../Calendar'
import { RoomsCanvas } from '../RoomsCanvas'

export const MainContent = observer(() => {
    if (!AppStore.authStore.connected) {
        return <Login />
    }
    if (AppStore.eventsStore.roomName === '') {
        return <RoomsCanvas />
    }
    return <RoomCalendar />
})
