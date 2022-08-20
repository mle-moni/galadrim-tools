import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button, Stack, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { amountColumns, roomColumns, timeColumns } from './columns'
import { StatisticsStore } from './StatisticsStore'

const StatisticsPage = () => {
    const statisticStore = useMemo(() => new StatisticsStore(), [])

    return (
        <MainLayout fullscreen={false}>
            <Stack direction="column" sx={{ p: 4 }}>
                <Button
                    startIcon={<BackIcon />}
                    variant="contained"
                    onClick={() => AppStore.navigate('/rooms')}
                    sx={{ mb: 2, mr: 'auto' }}
                >
                    Retour
                </Button>
                <Typography variant="h3" gutterBottom>
                    Statistiques de Rooms
                </Typography>
                <Typography variant="h5" gutterBottom>
                    La salle préférée des Galadrimeurs 💕
                </Typography>
                <div
                    style={{
                        height: 400,
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                >
                    <DataGrid
                        rows={statisticStore.roomData.slice()}
                        columns={roomColumns}
                        pageSize={10}
                        rowsPerPageOptions={[5]}
                    />
                </div>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                    Temps de réservation 🕐
                </Typography>
                <div
                    style={{
                        height: 400,
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                >
                    <DataGrid
                        rows={toJS(statisticStore.timePerUserData)}
                        columns={timeColumns}
                        pageSize={10}
                        rowsPerPageOptions={[5]}
                    />
                </div>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                    Nombre de réservations 🚀
                </Typography>
                <div
                    style={{
                        height: 400,
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                >
                    <DataGrid
                        rows={statisticStore.amountPerUserData.slice()}
                        columns={amountColumns}
                        pageSize={10}
                        rowsPerPageOptions={[5]}
                    />
                </div>
            </Stack>
        </MainLayout>
    )
}

export default observer(StatisticsPage)
