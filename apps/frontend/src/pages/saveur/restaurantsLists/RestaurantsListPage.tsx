import { IRestaurant } from '@galadrim-tools/shared'
import { ArrowBack } from '@mui/icons-material'
import { Box, CardMedia, List, ListItem, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import { AppStore } from '../../../globalStores/AppStore'
import { RestaurantsStore } from '../../../globalStores/RestaurantsStore'
import { CenteredDiv } from '../../../reusableComponents/common/CenteredDiv'
import { RoundedLinks } from '../../../reusableComponents/common/RoundedLinks'
import NotFoundPage from '../../errors/404/NotFoundPage'
import { getImageUrl, RestaurantTags } from '../restaurants/RestaurantCard'

const getRestaurantList = (
    restaurantsStore: RestaurantsStore,
    listName?: string
): { list: IRestaurant[]; pageName: string } | null => {
    if (listName === 'best') {
        return {
            list: restaurantsStore.bestRestaurants,
            pageName: 'Les 5 meilleurs restaurants',
        }
    }
    if (listName === 'worst') {
        return {
            list: restaurantsStore.worstRestaurants,
            pageName: 'Les 5 pires restaurants',
        }
    }
    if (listName === 'new') {
        return {
            list: restaurantsStore.newRestaurants,
            pageName: 'Les 5 derniers restaurants à être ajoutés',
        }
    }
    return null
}

const RestaurantsListPage = observer(() => {
    const { listName } = useParams<{ listName: string }>()
    const restaurantsStore = AppStore.saveurStore.restaurantsStore

    const params = getRestaurantList(restaurantsStore, listName)

    if (params === null) {
        return <NotFoundPage />
    }

    return (
        <Box>
            <RoundedLinks linkInfos={[{ Icon: ArrowBack, link: '/saveur' }]} />
            <Typography variant="h3" sx={{ textAlign: 'center' }}>
                {params.pageName}
            </Typography>
            <CenteredDiv style={{ backgroundColor: 'var(--main-color)' }}>
                <List sx={{ width: '80vw' }}>
                    {params.list.map(({ id, name, image, description, tags }, index) => {
                        return (
                            <Box
                                key={id}
                                sx={{
                                    padding: 4,
                                }}
                            >
                                <ListItem
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                    }}
                                >
                                    <Typography sx={{ fontSize: 'x-large' }}>
                                        {`${index + 1} ➝ ${name}`}
                                    </Typography>
                                    <RestaurantTags tags={tags} />
                                    <Typography>{description}</Typography>
                                    <br />
                                    <CardMedia
                                        component="img"
                                        height={300}
                                        src={getImageUrl(image)}
                                        sx={{ borderRadius: '4px' }}
                                    />
                                </ListItem>
                            </Box>
                        )
                    })}
                </List>
            </CenteredDiv>
        </Box>
    )
})

export default RestaurantsListPage
