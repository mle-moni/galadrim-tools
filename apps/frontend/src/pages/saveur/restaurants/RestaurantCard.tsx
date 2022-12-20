import { IImage, IRestaurant, ITag, NOTES_VALUES } from '@galadrim-tools/shared'
import { Close, Edit, Favorite, Room } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Collapse,
    Typography,
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getApiUrl } from '../../../api/fetch'
import { AppStore } from '../../../globalStores/AppStore'
import { MAX_ZOOM, SaveurStore } from '../../../globalStores/SaveurStore'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import RatingComponent from './RatingComponent'
import Ratings from './Ratings'
import { RestaurantCardStore } from './RestaurantCardStore'

export const DEFAULT_RESTAURANT_IMAGE_PATH = '/default/restaurant.svg'

export const RestaurantTags = observer<{ tags: ITag[]; saveurStore: SaveurStore }>(
    ({ tags, saveurStore }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {tags.map(({ id, name }) => (
                <Box
                    key={id}
                    onClick={() => {
                        saveurStore.restaurantsStore.setSearch(name)
                    }}
                >
                    <Chip label={name} variant="filled" sx={{ margin: 0.5, cursor: 'pointer' }} />
                </Box>
            ))}
        </Box>
    )
)

export const getImageUrl = (image: IImage | null) => {
    if (image === null) {
        return `${getApiUrl()}${DEFAULT_RESTAURANT_IMAGE_PATH}`
    }
    return `${getApiUrl()}${image.url}`
}

interface RestaurantCardProps {
    restaurant: IRestaurant
    saveurStore: SaveurStore
}

export const RestaurantCard = observer<RestaurantCardProps>(({ restaurant, saveurStore }) => {
    const store = useMemo(() => new RestaurantCardStore(restaurant), [restaurant])
    const [, setSearchParams] = useSearchParams()

    const choosen = AppStore.authStore.user.dailyChoice === restaurant.id

    return (
        <Card
            key={restaurant.name}
            sx={{ maxWidth: 400 }}
            style={{ boxShadow: '1px 5px 5px grey' }}
        >
            <CardMedia component="img" height="180" image={getImageUrl(restaurant.image)} />
            <CardContent>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ flex: 1 }} gutterBottom variant="h5" component="div">
                        {restaurant.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        gutterBottom
                        sx={{ fontSize: 16, marginLeft: 2, marginTop: 0.5 }}
                    >
                        {restaurant.averagePrice && `${restaurant.averagePrice}€`}
                    </Typography>
                </Box>
                <RestaurantTags tags={restaurant.tags} saveurStore={saveurStore} />
                <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                </Typography>
                <Ratings ratios={store.ratios} onClick={(id) => store.saveRating(id)} />
            </CardContent>
            <Collapse in={store.isRatingDevelopped}>
                <RatingComponent
                    onClick={(id) => {
                        store.saveRating(id)
                    }}
                />
            </Collapse>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Button onClick={() => store.toggleIsRatingDevelopped()} size="small">
                    {store.rating ? NOTES_VALUES[store.rating] : <Favorite />}
                </Button>
                <CustomLink to={`/saveur/restaurants/${restaurant.id}`}>
                    <Edit />
                </CustomLink>
                <Button
                    size="small"
                    onClick={() => {
                        saveurStore.leafletMap.flyTo(
                            { lat: restaurant.lat, lng: restaurant.lng },
                            MAX_ZOOM
                        )
                    }}
                    title="Afficher sur la carte"
                >
                    <Room />
                </Button>
                <Button
                    size="small"
                    onClick={() => {
                        saveurStore.restaurantsStore.chooseRestaurant(restaurant.id)
                    }}
                    title="Je vais y manger ce midi"
                >
                    <img
                        src={getApiUrl() + `/maps/i_choose_you.png`}
                        style={{ width: 25, height: 25, filter: `grayscale(${choosen ? 0 : 1})` }}
                    />
                </Button>
                <Button
                    size="small"
                    onClick={() => {
                        setSearchParams(
                            (searchParams) =>
                                new URLSearchParams({
                                    zoom: searchParams.get('zoom') ?? MAX_ZOOM.toString(),
                                })
                        )
                        saveurStore.restaurantsStore.setRestaurantClicked()
                    }}
                    title="Fermer"
                >
                    <Close />
                </Button>
            </CardActions>
        </Card>
    )
})
