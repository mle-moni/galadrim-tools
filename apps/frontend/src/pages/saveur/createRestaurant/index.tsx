import { useMemo } from 'react'
import { SaveurStore } from '../../../../../frontend/src/components/saveur/SaveurStore'
import MainLayout from '../../../components/layouts/MainLayout'
import { CreateRestaurant } from '../../../components/saveur/CreateRestaurant'

export const CreateRestaurantPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateRestaurant saveurStore={saveurStore} />
            </div>
        </MainLayout>
    )
}

export default CreateRestaurantPage
