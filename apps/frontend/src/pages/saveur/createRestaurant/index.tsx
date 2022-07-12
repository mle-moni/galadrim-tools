import { CreateRestaurant } from '../../../components/saveur/createRestaurant'
import MainLayout from '../../../components/layouts/MainLayout'
import { useRights } from '../../../hooks/useRights'


export const CreateRestaurantPage = () => {
    useRights('all', ['USER_ADMIN'], '/saveur')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateRestaurant />
            </div>
        </MainLayout>
    )
}

export default CreateRestaurantPage
