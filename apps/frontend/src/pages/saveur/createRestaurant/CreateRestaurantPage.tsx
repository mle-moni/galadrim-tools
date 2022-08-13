import { observer } from 'mobx-react'
import { AppStore } from '../../../globalStores/AppStore'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { EditRestaurant } from '../restaurants/createEdit/EditRestaurant'

export const CreateRestaurantPage = observer(() => {
    const saveurStore = AppStore.saveurStore

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <EditRestaurant mode="create" saveurStore={saveurStore} />
            </div>
        </MainLayout>
    )
})

export default CreateRestaurantPage
