import { observer } from 'mobx-react'
import { useParams } from 'react-router-dom'
import { AppStore } from '../../../globalStores/AppStore'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { EditRestaurant } from '../restaurants/createEdit/EditRestaurant'

export const EditRestaurantPage = observer(() => {
    const saveurStore = AppStore.saveurStore

    const { id } = useParams()

    const restaurantFound = AppStore.saveurStore.restaurantsStore.restaurants.find(
        (restaurant) => restaurant.id.toString() === id
    )

    if (restaurantFound === undefined) {
        return null
    }
    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <EditRestaurant
                    mode="edit"
                    restaurant={restaurantFound}
                    saveurStore={saveurStore}
                />
            </div>
        </MainLayout>
    )
})

export default EditRestaurantPage
