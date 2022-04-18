import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { RoomCalendar } from '../../components/Calendar'
import MainLayout from '../../components/layouts/MainLayout'
import { AppStore } from '../../stores/AppStore'

const RoomPage = () => {
    let params = useParams()
    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? '*')
    }, [])

    return (
        <MainLayout>
            <div>
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                    <Button variant="outlined" onClick={() => AppStore.navigate('/')}>
                        Retour
                    </Button>
                </Box>
                <RoomCalendar />
            </div>
        </MainLayout>
    )
}

export default RoomPage
