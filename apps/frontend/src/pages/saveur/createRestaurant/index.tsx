import { CreateRestaurant } from '../../../components/saveur/CreateRestaurant'
import MainLayout from '../../../components/layouts/MainLayout'
import { useRights } from '../../../hooks/useRights'
import { useMemo } from 'react'
import { SaveurStore } from '../../../../../frontend/src/components/saveur/SaveurStore'


export const CreateRestaurantPage = () => {
    const saveurStore = useMemo(() => new SaveurStore(), [])
    useRights('all', ['USER_ADMIN'], '/saveur')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateRestaurant  saveurStore={saveurStore}/>
            </div>
        </MainLayout>
    )
}

export default CreateRestaurantPage