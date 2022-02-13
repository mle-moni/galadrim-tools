import { DataGrid } from '@mui/x-data-grid'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { useMemo } from 'react'
import MainLayout from '../../components/layouts/MainLayout'
import { roomColumns, timeColumns } from './columns'
import { StatisticsStore } from './StatisticsStore'

const StatisticsPage = () => {
    const statisticStore = useMemo(() => new StatisticsStore(), [])

    return (
        <MainLayout>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1>Statistics</h1>
                <h2>La salle préférée des Galadrimeurs</h2>
                <div
                    style={{
                        height: 200,
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
                <h2>Temps de réservation</h2>
                <div
                    style={{
                        height: 200,
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
                {/* <h2>Nombre de réservation</h2>
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
                </div> */}
            </div>
        </MainLayout>
    )
}

export default observer(StatisticsPage)
