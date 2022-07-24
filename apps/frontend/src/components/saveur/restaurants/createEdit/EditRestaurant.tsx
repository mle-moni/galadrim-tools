import { IRestaurant } from '@galadrim-rooms/shared'
import { LocationOn, Message, Storefront, Style } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Autocomplete, Button, InputAdornment, OutlinedInput, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Fragment, useMemo } from 'react'
import { getApiUrl } from '../../../../api/fetch'
import { GaladrimLogo } from '../../../Branding/GaladrimLogo'
import { Card } from '../../../Core/Card'
import { CustomLink } from '../../../Core/CustomLink'
import { SaveurStore } from '../../SaveurStore'
import { RestaurantStore } from './RestaurantStore'

export type EditRestaurantProps = { saveurStore: SaveurStore } & (
    | {
          mode: 'create'
      }
    | {
          mode: 'edit'
          restaurant: IRestaurant
      }
)

export const EditRestaurant = observer<EditRestaurantProps>((props) => {
    const { saveurStore, mode } = props

    const createRestaurantStore = useMemo(
        () =>
            props.mode === 'edit' ? new RestaurantStore(props.restaurant) : new RestaurantStore(),
        []
    )

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    if (mode === 'create') {
                        createRestaurantStore.createRestaurant()
                    } else {
                        createRestaurantStore.editRestaurant()
                    }
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
                    onChange={(_, newValue) => {
                        createRestaurantStore.setTags(newValue)
                    }}
                    options={saveurStore.tagsStore.tags}
                    getOptionLabel={(option) => option.name}
                    noOptionsText="Pas de tags trouvés"
                    isOptionEqualToValue={(option, value) => option.name === value.name}
                    filterSelectedOptions
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={
                                <Fragment>
                                    <Style />
                                </Fragment>
                            }
                            placeholder="Ajouter des tags"
                        />
                    )}
                    sx={{ mt: 2 }}
                />
                <Button variant="contained" component="label" sx={{ my: 2 }}>
                    {mode === 'create' ? 'Ajouter une image' : `Changer l'image`}
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        id="image"
                        multiple
                        onChange={(e) => createRestaurantStore.setUploadedImage(e.target)}
                    />
                </Button>
                {createRestaurantStore.image !== null && (
                    <span style={{ marginLeft: '12px' }}>({createRestaurantStore.image.name})</span>
                )}
                <br />
                {createRestaurantStore.imageSrc !== null && createRestaurantStore.image === null && (
                    <div className="flex justify-center">
                        <img
                            src={getApiUrl() + createRestaurantStore.imageSrc}
                            alt={createRestaurantStore.description}
                            style={{ maxWidth: 300, maxHeight: 300 }}
                        />
                    </div>
                )}
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!createRestaurantStore.canCreateRestaurant}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    {mode === 'create' ? 'Ajouter' : 'Editer'} le restaurant
                </Button>
                <CustomLink to="/saveur">
                    <BackIcon /> Retour au plan
                </CustomLink>
            </form>
        </Card>
    )
})
