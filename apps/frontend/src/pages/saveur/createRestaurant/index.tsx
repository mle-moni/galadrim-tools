import MainLayout from '../../../components/layouts/MainLayout'
import { EditRestaurant } from '../../../components/saveur/restaurants/createEdit/EditRestaurant'
import { AppStore } from '../../../stores/AppStore'

export const CreateRestaurantPage = () => {
    const saveurStore = AppStore.saveurStore

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <EditRestaurant mode="create" saveurStore={saveurStore} />
            </div>
        </MainLayout>
    )
}

export default CreateRestaurantPage
