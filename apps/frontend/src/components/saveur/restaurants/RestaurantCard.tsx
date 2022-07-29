import { IImage, IRestaurant, NOTES_VALUES } from '@galadrim-rooms/shared'
import { Close, Edit, Room } from '@mui/icons-material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { Collapse } from '@mui/material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { getApiUrl } from '../../../api/fetch'
import { MAX_ZOOM } from '../../../pages/saveur'
import { CustomLink } from '../../Core/CustomLink'
import { RestaurantCardStore } from '../RestaurantCardStore'
import { SaveurStore } from '../SaveurStore'
import RatingComponent from './RatingComponent'

export const DEFAULT_RESTAURANT_IMAGE_PATH = '/default/restaurant.svg'

const getImageUrl = (image: IImage | null) => {
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
                <Typography variant="body2" color="text.secondary">
                    {restaurant.description}
                </Typography>
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
                    {store.rating ? NOTES_VALUES[store.rating] : <FavoriteIcon />}
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
