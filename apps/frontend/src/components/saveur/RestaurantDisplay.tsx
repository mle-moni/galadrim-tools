import { observer } from 'mobx-react-lite'
import { RestaurantCard } from './RestaurantCard'
import { SaveurStore } from './SaveurStore'

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
