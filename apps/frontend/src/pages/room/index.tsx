import { Box, Button } from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { RoomCalendar } from '../../components/Calendar'
import MainLayout from '../../components/layouts/MainLayout'
import { AppStore } from '../../stores/AppStore'
import BackIcon from '@mui/icons-material/ChevronLeft'

const RoomPage = () => {
    const params = useParams()

    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? '*')
    }, [])

    return (
        <MainLayout fullscreen>
            <div>
                <Box sx={{ position: 'absolute', top: 32, left: 32, zIndex: 10 }}>
                    <Button
                        startIcon={<BackIcon />}
                        variant="contained"
                        onClick={() => AppStore.navigate('/')}
                    >
                        Retour
                    </Button>
                </Box>
                <RoomCalendar />
            </div>
        </MainLayout>
    )
}

export default RoomPage
