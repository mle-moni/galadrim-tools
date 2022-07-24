import { Box, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { SaveurStore } from '../SaveurStore'
import { RestaurantDisplay } from './RestaurantDisplay'
import { RestaurantResults } from './RestaurantResults'

export const SaveurLeftMenu = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    return (
        <Box
            sx={{
                zIndex: 6,
                top: 0,
                left: 0,
                width: '400px',
                position: 'absolute',
                pt: 1,
                pl: 1,
                backgroundColor: 'rgba(200,200,200,0.4)',
            }}
        >
            <Box className="flex justify-center align-center" sx={{ pb: 1 }}>
                <TextField
                    sx={{ backgroundColor: 'white' }}
                    placeholder="Rechercher un restaurant"
                    value={saveurStore.restaurantsStore.search}
                    onChange={(e) => {
                        saveurStore.restaurantsStore.setSearch(e.target.value)
                    }}
                    fullWidth
                />
            </Box>
            <RestaurantResults saveurStore={saveurStore} />
            <RestaurantDisplay saveurStore={saveurStore} />
        </Box>
    )
})
