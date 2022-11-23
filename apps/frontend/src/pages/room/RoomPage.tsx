import { Loop } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Box, Button, Tooltip } from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppStore } from '../../globalStores/AppStore'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { RoomCalendar } from './RoomCalendar'

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
                        onClick={() => AppStore.navigate('/rooms')}
                    >
                        Retour
                    </Button>
                </Box>
                <Box sx={{ position: 'absolute', top: 96, left: 32, zIndex: 10 }}>
                    <Tooltip title="Charger toutes les réservations, par défaut seulement 200 réservations sont chargées">
                        <Button
                            startIcon={<Loop />}
                            variant="contained"
                            onClick={() => AppStore.eventsStore.fetchEvents(true)}
                        >
                            Charger plus
                        </Button>
                    </Tooltip>
                </Box>
                <RoomCalendar />
            </div>
        </MainLayout>
    )
}

export default RoomPage
