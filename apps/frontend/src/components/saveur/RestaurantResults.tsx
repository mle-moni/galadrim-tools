import { Box, Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { MAX_ZOOM } from '../../pages/saveur'
import { SaveurStore } from './SaveurStore'

export const RestaurantResults = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    const pattern = saveurStore.restaurantsStore.search
    const searchResults = saveurStore.restaurantsStore.fuseInstance.search(pattern).slice(0, 5)

    if (searchResults.length === 0) {
        return null
    }

    return (
        <Box
            sx={{
                bgcolor: 'white',
                mb: 1,
                p: 1,
                borderRadius: '4px',
            }}
        >
            {searchResults.map(({ item: resto }) => (
                <Button
                    key={resto.id}
                    sx={{ display: 'block', textTransform: 'none' }}
                    onClick={() => {
                        saveurStore.restaurantsStore.setRestaurantClicked(resto)
                        saveurStore.leafletMap.flyTo({ lat: resto.lat, lng: resto.lng }, MAX_ZOOM)
                    }}
                >
                    {resto.name}
                </Button>
            ))}
        </Box>
    )
})
