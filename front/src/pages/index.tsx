import { observer } from "mobx-react-lite"
import { RoomCalendar } from "../components/Calendar"
import { Rooms } from "../Rooms"
import { AppStore } from "../stores/AppStore"

export const IndexPage = observer(() => {
    return (
        <>
            {AppStore.eventsStore.roomName === '' ? <Rooms /> : <RoomCalendar />}
        </>
    )
})
