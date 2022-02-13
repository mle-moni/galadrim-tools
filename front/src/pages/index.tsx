import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { RoomsCanvas } from '../components/RoomsCanvas'
import MainLayout from '../layouts/MainLayout'
import { AppStore } from '../stores/AppStore'

const HomePage = observer(() => {
    useEffect(() => {
        AppStore.eventsStore.setRoomName('')
    }, [])

    return (
        <MainLayout>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <RoomsCanvas />
            </div>
        </MainLayout>
    )
})

export default HomePage
