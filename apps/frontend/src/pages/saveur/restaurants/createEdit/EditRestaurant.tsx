import { IRestaurant } from '@galadrim-rooms/shared'
import { LocationOn, Message, Storefront, Style, Tag } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import {
    Autocomplete,
    Button,
    InputAdornment,
    Modal,
    OutlinedInput,
    Paper,
    TextField,
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Fragment, useMemo } from 'react'
import { getApiUrl } from '../../../../api/fetch'
import { AppStore } from '../../../../globalStores/AppStore'
import { SaveurStore } from '../../../../globalStores/SaveurStore'
import { GaladrimLogo } from '../../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../../reusableComponents/Core/GaladrimRoomsCard'
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

    const tagsStore = AppStore.saveurStore.tagsStore

    return (
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
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
                <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    onClick={() => tagsStore.setCreationModalVisible(true)}
                >
                    Ajouter un tag
                </Button>
                <Modal
                    open={tagsStore.creationModalVisible}
                    onClose={() => tagsStore.setCreationModalVisible(false)}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Paper variant="outlined" sx={{ p: 6 }}>
                        <OutlinedInput
                            value={tagsStore.newTagName}
                            onChange={(e) => {
                                tagsStore.setNewTagName(e.target.value)
                            }}
                            fullWidth
                            placeholder="Nom du tag"
                            startAdornment={
                                <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                                    <Tag />
                                </InputAdornment>
                            }
                            sx={{ mt: 2 }}
                        />
                        <Button
                            onClick={() => tagsStore.createTag()}
                            fullWidth
                            disabled={!tagsStore.canSave}
                            variant="contained"
                            size="large"
                            sx={{ mt: 2 }}
                        >
                            Ajouter le tag
                        </Button>
                    </Paper>
                </Modal>
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
        </GaladrimRoomsCard>
    )
})
