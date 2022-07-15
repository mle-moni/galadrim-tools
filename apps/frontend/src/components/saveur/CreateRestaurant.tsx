import { IRestaurant, ITag } from '@galadrim-rooms/shared'
import { Message, Storefront, LocationOn, Style, Image, BarChartTwoTone } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Autocomplete, Button, InputAdornment, OutlinedInput, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Fragment, useMemo } from 'react'
import { fetchTags } from '../../api/tags'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'
import { CreateRestaurantStore } from './createRestaurantStore'
import { SaveurStore } from './SaveurStore'

export const CreateRestaurant = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    const createRestaurantStore = useMemo(() => new CreateRestaurantStore(), [])

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    createRestaurantStore.createRestaurant()
                }}
            >
                <OutlinedInput
                    value={createRestaurantStore.name}
                    onChange={(e) => {
                        createRestaurantStore.setName(e.target.value)
                    }}
                    fullWidth
                    placeholder="Nom du restaurant"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <Storefront />
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
                <OutlinedInput
                    value={createRestaurantStore.description}
                    onChange={(e) => {
                        createRestaurantStore.setDescription(e.target.value)
                    }}
                    fullWidth
                    placeholder="Description"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <Message />
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
                <OutlinedInput
                    value={createRestaurantStore.coordinates}
                    onChange={(e) => {
                        createRestaurantStore.setCoordinates(e.target.value)
                    }}
                    fullWidth
                    placeholder="Latitude, Longitude"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <LocationOn />
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
                <Autocomplete
                    multiple
                    id="tags"
                    value={createRestaurantStore.tags}
                    onChange={(event, newValue) => {
                        createRestaurantStore.setTags(newValue)
                    }}
                    options={saveurStore.tagsStore.tags}
                    getOptionLabel={(option) => option.name}
                    filterSelectedOptions
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={
                                <Fragment>
                                    <Style /> Tags
                                </Fragment>
                            }
                            placeholder="Ajouter des tags"
                        />
                    )}
                    sx={{ mt: 2 }}
                />
                <OutlinedInput
                    value={createRestaurantStore.image}
                    onChange={(e) => {
                        createRestaurantStore.setImage(e.target.value)
                    }}
                    fullWidth
                    placeholder="Image URL (optionnel)"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <Image />
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!createRestaurantStore.canCreateRestaurant}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Ajouter le restaurant
                </Button>
                <CustomLink to="/saveur">
                    <BackIcon /> Retour au plan
                </CustomLink>
            </form>
        </Card>
    )
})
