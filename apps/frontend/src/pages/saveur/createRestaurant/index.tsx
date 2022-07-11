import { CreateRestaurant } from 'apps/frontend/src/components/saveur/createRestaurant'
import MainLayout from '../../../components/layouts/MainLayout'

export const CreateRestaurantPage = () => {

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateRestaurant />
            </div>
        </MainLayout>
    )
}

export default CreateRestaurantPage
