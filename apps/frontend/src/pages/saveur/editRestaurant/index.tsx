import { useParams } from 'react-router-dom'
import MainLayout from '../../../components/layouts/MainLayout'
import { EditRestaurant } from '../../../components/saveur/restaurants/createEdit/EditRestaurant'
import { AppStore } from '../../../stores/AppStore'

export const EditRestaurantPage = () => {
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
}

export default EditRestaurantPage
