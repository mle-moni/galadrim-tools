import { Loop } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Box, Button, FormControlLabel, Switch, Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppStore } from '../../globalStores/AppStore'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { RoomCalendar } from './RoomCalendar'

const RoomPage = () => {
    const [fiveMinutesSlotMode, setFiveMinutesSlotMode] = useState(false)
    const [nantes, setNantes] = useState(false)
    const params = useParams()

    useEffect(() => {
        AppStore.eventsStore.setRoomName(params.roomName ?? '*')
    }, [])

    return (
        <MainLayout fullscreen noDisconnect>
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
                <Box sx={{ position: 'absolute', top: 32, left: 180, zIndex: 10 }}>
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
                <Box sx={{ position: 'absolute', top: 86, left: 32, zIndex: 10 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={fiveMinutesSlotMode}
                                onChange={() => setFiveMinutesSlotMode(!fiveMinutesSlotMode)}
                            />
                        }
                        label="slots de 5 minutes"
                        sx={{ userSelect: 'none' }}
                    />
                </Box>
                <Box sx={{ position: 'absolute', top: 86, left: 300, zIndex: 10 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={nantes} onChange={() => setNantes((prev) => !prev)} />
                        }
                        label="Nantes"
                        sx={{ userSelect: 'none' }}
                    />
                </Box>
                <RoomCalendar step={fiveMinutesSlotMode ? 5 : 15} nantes={nantes} />
            </div>
        </MainLayout>
    )
}

export default RoomPage
