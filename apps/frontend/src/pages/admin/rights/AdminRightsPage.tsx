import { useRights } from '../../../hooks/useRights'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { EditUserRights } from './EditUserRights'

export const AdminRightsPage = () => {
    useRights('all', ['RIGHTS_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <EditUserRights />
            </div>
        </MainLayout>
    )
}

export default AdminRightsPage
