import { Home, RestaurantMenu } from '@mui/icons-material'
import { Box, CardMedia, List, ListItem, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../../globalStores/AppStore'
import { CenteredDiv } from '../../../reusableComponents/common/CenteredDiv'
import { RoundedLinks } from '../../../reusableComponents/common/RoundedLinks'
import { getImageUrl, RestaurantTags } from '../restaurants/RestaurantCard'

const BestRestaurantsPage = observer(() => {
    const restaurantsStore = AppStore.saveurStore.restaurantsStore

    return (
        <Box>
            <RoundedLinks
                linkInfos={[
                    { Icon: Home, link: '/' },
                    { Icon: RestaurantMenu, link: '/saveur' },
                ]}
            />
            <CenteredDiv>
                <Typography variant="h3">Les 5 meilleurs restaurants</Typography>
            </CenteredDiv>
            <CenteredDiv style={{ backgroundColor: 'var(--main-color)' }}>
                <List sx={{ width: '80vw' }}>
                    {restaurantsStore.bestRestaurants.map(
                        ({ id, name, image, description, tags }, index) => {
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
                        }
                    )}
                </List>
            </CenteredDiv>
        </Box>
    )
})

export default BestRestaurantsPage
