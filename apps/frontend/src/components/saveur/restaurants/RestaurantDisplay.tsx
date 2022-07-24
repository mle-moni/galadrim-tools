import { observer } from 'mobx-react-lite'
import { SaveurStore } from '../SaveurStore'
import { RestaurantCard } from './RestaurantCard'

export const RestaurantDisplay = observer<{ saveurStore: SaveurStore }>(({ saveurStore }) => {
    if (saveurStore.restaurantsStore.restaurantClicked === undefined) {
        return null
    }

    return (
        <RestaurantCard
            restaurant={saveurStore.restaurantsStore.restaurantClicked}
            saveurStore={saveurStore}
        />
    )
})
