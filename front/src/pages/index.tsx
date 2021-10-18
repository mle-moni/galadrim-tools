import { Button } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { RoomCalendar } from "../components/Calendar"
import { RenouvArtWait } from "../components/RenouvArtWait"
import { RoomsCanvas } from "../components/RoomsCanvas"
import { UsernamePicker } from "../components/UsernamePicker"
import { AppStore } from "../stores/AppStore"

export const IndexPage = observer(() => {
    return (
        <div className="flex h-100vh justify-center align-center main-bg" style={{ boxSizing: 'border-box' }}>
            {AppStore.appIsReady ? (
                <div>
                    <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 10 }}>
                        {AppStore.username !== '' ? (
                            <UsernamePicker />
                        ) : <></>}
                    </div>
                    <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 10 }}>
                        {AppStore.eventsStore.roomName !== '' ? (
                            <Button onClick={() => AppStore.eventsStore.setRoomName('')}>
                                Retour
                            </Button>
                        ) : <></>}
                    </div>
                    {AppStore.username !== '' ? (
                        AppStore.eventsStore.roomName === '' ? <RoomsCanvas /> : <RoomCalendar />
                    ) : <UsernamePicker />}
                </div>
            ) : <RenouvArtWait />}
        </div>
    )
})
