import { Typography } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { HTTP_METHODS_OPTIONS } from '../../api/fetch'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { CaddyLog, CaddyLogsStore } from './CaddyLogsStore'

const columns: MRT_ColumnDef<CaddyLog>[] = [
    {
        accessorKey: 'ts',
        header: 'Timestamp',
        size: 25,
    },
    {
        accessorKey: 'request.method',
        header: 'Methode',
        filterVariant: 'select',
        filterSelectOptions: HTTP_METHODS_OPTIONS,
        size: 25,
    },
    {
        accessorKey: 'request.host',
        header: 'Host',
        size: 25,
    },
    {
        accessorKey: 'request.uri',
        header: 'Uri',
        size: 25,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        filterVariant: 'range',
        size: 25,
    },
    {
        accessorKey: 'duration_in_ms',
        header: 'Duration (ms)',
        filterVariant: 'range',
        size: 25,
    },
    {
        accessorKey: 'duration_in_s',
        header: 'Duration (s)',
        size: 25,
    },
    {
        accessorKey: 'request.client_ip',
        header: 'Client IP',
        size: 25,
    },
    {
        accessorKey: 'level',
        header: 'level',
        size: 25,
    },
    {
        accessorKey: 'request_bytes_read',
        header: 'Req bytes read',
        filterVariant: 'range',
        size: 25,
    },
    {
        accessorKey: 'response_size',
        header: 'Res size',
        filterVariant: 'range',
        size: 25,
    },
    {
        accessorKey: 'msg',
        header: 'Message',
        size: 25,
    },
    {
        accessorKey: 'logger',
        header: 'Logger',
        size: 25,
    },
]

export const CaddyLogsPage = observer(() => {
    const caddyLogsStore = useMemo(() => new CaddyLogsStore(), [])
    const { id } = useParams()

    useEffect(() => {
        caddyLogsStore.fetch(id ?? 'NOT_FOUND')
    }, [id, caddyLogsStore])

    const table = useMaterialReactTable({
        columns,
        data: caddyLogsStore.data,
        state: { isLoading: caddyLogsStore.loadingState.isLoading },
    })

    return (
        <MainLayout fullscreen>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GaladrimRoomsCard size="large" sx={{ width: '90%' }}>
                        <GaladrimLogo align="center" sx={{ mb: 8 }} />
                        <Typography sx={{ fontSize: 26, textAlign: 'center', m: 2 }}>
                            Logs Caddy
                        </Typography>
                        <MaterialReactTable table={table} />
                    </GaladrimRoomsCard>
                </div>
            </LocalizationProvider>
        </MainLayout>
    )
})

export default CaddyLogsPage
