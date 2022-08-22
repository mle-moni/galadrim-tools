import { IRestaurant } from '@galadrim-tools/shared'
import { LocationOn, Message, Storefront, Style, Tag } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Autocomplete, Button, Modal, Paper, TextField } from '@mui/material'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Fragment, useMemo } from 'react'
import { getApiUrl } from '../../../../api/fetch'
import { AppStore } from '../../../../globalStores/AppStore'
import { SaveurStore } from '../../../../globalStores/SaveurStore'
import { GaladrimLogo } from '../../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../../reusableComponents/Core/GaladrimRoomsCard'
import { TextInputWithIcon } from '../../../../reusableComponents/form/TextInputWithIcon'
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
                <TextInputWithIcon
                    value={createRestaurantStore.name}
                    placeholder="Nom du restaurant"
                    onChange={(value) => createRestaurantStore.setName(value)}
                    Icon={Storefront}
                />
                <TextInputWithIcon
                    value={createRestaurantStore.description}
                    placeholder="Description"
                    onChange={(value) => createRestaurantStore.setDescription(value)}
                    Icon={Message}
                />
                <TextInputWithIcon
                    value={createRestaurantStore.coordinates}
                    placeholder="Latitude, Longitude"
                    onChange={(value) => createRestaurantStore.setCoordinates(value)}
                    Icon={LocationOn}
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
                        <TextInputWithIcon
                            value={tagsStore.newTagName}
                            placeholder="Nom du tag"
                            onChange={(value) => tagsStore.setNewTagName(value)}
                            Icon={Tag}
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
                    value={toJS(createRestaurantStore.tags)}
                    onChange={(_, newValue) => {
                        createRestaurantStore.setTags(newValue)
                    }}
                    options={toJS(saveurStore.tagsStore.tags)}
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
