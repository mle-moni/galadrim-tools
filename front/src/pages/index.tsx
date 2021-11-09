import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'
import { Whoami } from '../components/auth/Whoami'
import { MainContent } from '../components/MainContent'
import { RenouvArtWait } from '../components/RenouvArtWait'
import { AppStore } from '../stores/AppStore'

const AppPage = observer(() => {
    useEffect(() => {
        AppStore.eventsStore.resetEvents()
    }, [AppStore.authStore.connected])

    return (
        <div
            className="flex h-100vh justify-center align-center main-bg"
            style={{ boxSizing: 'border-box' }}
        >
            {AppStore.appIsReady ? (
                <div>
                    <div style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 10 }}>
                        {AppStore.authStore.connected ? <Whoami /> : <></>}
                    </div>
                    <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 10 }}>
                        {AppStore.eventsStore.roomName !== '' ? (
                            <Button onClick={() => AppStore.eventsStore.setRoomName('')}>
                                Retour
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>
                    <MainContent />
                </div>
            ) : (
                <RenouvArtWait />
            )}
        </div>
    )
})

export const App = () => {
    const snackbarMethods = useSnackbar()
    AppStore.notification.setMethods(snackbarMethods)

    return <AppPage />
}
