import { SwapHoriz } from '@mui/icons-material'
import { Fab } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { SaveurStore } from '../../globalStores/SaveurStore'
import { POS_OFFSET } from '../../reusableComponents/common/RoundedLinks'
import { getFavouriteLocauxIndex, setFavouriteLocauxIndex } from './persistLocauxPreferences'
import { MAX_ZOOM, POS_ALL_LOCAUX } from './SaveurPage'

export const LocauxSwitch = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    const [locauxIndex, setLocauxIndex] = useState(getFavouriteLocauxIndex())

    return (
        <Fab
            size="medium"
            variant="circular"
            color="primary"
            onClick={() => {
                const index = (locauxIndex + 1) % 2
                const [lat, lng] = POS_ALL_LOCAUX[index].position
                saveurStore.leafletMap.flyTo({ lat, lng }, MAX_ZOOM)
                setLocauxIndex(index)
                setFavouriteLocauxIndex(index)
            }}
            sx={{
                position: 'absolute',
                right: POS_OFFSET,
                bottom: POS_OFFSET,
            }}
        >
            <SwapHoriz />
        </Fab>
    )
})
