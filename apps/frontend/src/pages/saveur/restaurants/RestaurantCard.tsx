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
import { getApiUrl } from '../../../api/fetch'
import { SaveurStore } from '../../../globalStores/SaveurStore'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { MAX_ZOOM } from '../SaveurPage'
import RatingComponent from './RatingComponent'
import Ratings from './Ratings'
import { RestaurantCardStore } from './RestaurantCardStore'

export const DEFAULT_RESTAURANT_IMAGE_PATH = '/default/restaurant.svg'

export const RestaurantTags = observer<{ tags: ITag[] }>(({ tags }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {tags.map(({ id, name }) => (
            <Chip key={id} label={name} variant="filled" sx={{ margin: 0.5 }} />
        ))}
    </Box>
))

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

    return (
        <Card
            key={restaurant.name}
            sx={{ maxWidth: 400 }}
            style={{ cursor: 'pointer', boxShadow: '1px 5px 5px grey' }}
        >
            <CardMedia component="img" height="180" image={getImageUrl(restaurant.image)} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {restaurant.name}
                </Typography>
                <RestaurantTags tags={restaurant.tags} />
                <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                </Typography>
                <Ratings ratios={store.ratios} />
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
