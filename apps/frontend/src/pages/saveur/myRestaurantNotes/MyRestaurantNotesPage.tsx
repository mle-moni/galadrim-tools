import BackIcon from '@mui/icons-material/ChevronLeft'
import { Box, Button, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { NotesOption } from '../../../../../../libs/shared/src/saveur/notes'
import { NotesValue } from '../../../../../../libs/shared/src/saveur/notes'
import { NOTES_VALUES } from '../../../../../../libs/shared/src/saveur/notes'
import { AppStore } from '../../../globalStores/AppStore'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { MyRestaurantNotesStore } from './MyRestaurantNotesStore'

export type NoteRow = {
    id: number
    restaurantName: string
    note: NotesValue
    updatedAt: string
}

const compareNotes = (noteA: NotesValue, noteB: NotesValue) => {
    const correspondingANote: NotesOption = Object.keys(NOTES_VALUES).find((key: NotesValue) => NOTES_VALUES[key] === noteA)!;

    const correspondingBNote: NotesOption = Object.keys(NOTES_VALUES).find((key: NotesValue) => NOTES_VALUES[key] === noteB)!;

    return +correspondingANote - +correspondingBNote
}

const compareDates = (dateA: string, dateB: string) => {
    const d1 = Date.parse(dateA);
    const d2 = Date.parse(dateB);

    return d1 - d2
}

const NOTES_COLUMNS: GridColDef[] = [
    {
        field: 'restaurantName',
        headerName: 'Restaurant',
        width: 200,
    },
    {
        field: 'note',
        headerName: 'Note',
        width: 200,
        sortComparator: compareNotes,
    },
    {
        field: 'updatedAt',
        headerName: 'Date',
        width: 200,
        sortComparator: compareDates,
    },
]

export const MyRestaurantNotesPage = observer(() => {
    const store = useMemo(
        () => new MyRestaurantNotesStore(AppStore.saveurStore.restaurantsStore),
        [AppStore.saveurStore.restaurantsStore]
    )

    useEffect(() => {
        if (!store.loadingState.isLoading) {
            store.fetchNotes()
        }
    }, [])

    return (
        <MainLayout fullscreen>
            <Stack direction="column" sx={{ p: 4, height: '80vh' }}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        startIcon={<BackIcon />}
                        variant="contained"
                        onClick={() => AppStore.navigate('/saveur')}
                    >
                        Retour
                    </Button>
                </Box>
                <Typography variant="h3" gutterBottom>
                    Notes des restaurants
                </Typography>
                <div
                    style={{
                        height: 520,
                        width: '100%',
                        backgroundColor: 'rgba(255,255,255,0.5)',
                    }}
                >
                    <DataGrid
                        rows={store.rows.slice()}
                        columns={NOTES_COLUMNS}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                    />
                </div>
            </Stack>
        </MainLayout>
    )
})

export default MyRestaurantNotesPage
