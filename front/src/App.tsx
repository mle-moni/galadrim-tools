import { Button } from '@material-ui/core'
import { observer } from 'mobx-react-lite'
import { RenouvArtWait } from './components/RenouvArtWait'
import { UsernamePicker } from './components/UsernamePicker'
import { IndexPage } from './pages'
import { AppStore } from './stores/AppStore'

const App = observer(() => {
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
                        <IndexPage />
                    ) : <UsernamePicker />}
                </div>
            ) : <RenouvArtWait />}
        </div>
    )
})

export default App
