import { Button } from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { RoomCalendar } from '../../components/Calendar'
import MainLayout from '../../layouts/MainLayout'
import { AppStore } from '../../stores/AppStore'

const RoomPage = () => {
    let params = useParams()
    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? '*')
    }, [])

    return (
        <MainLayout>
            <div>
                <div style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 10 }}>
                    <Button onClick={() => AppStore.navigate('/')}>Retour</Button>
                </div>
                <RoomCalendar />
            </div>
        </MainLayout>
    )
}

export default RoomPage
