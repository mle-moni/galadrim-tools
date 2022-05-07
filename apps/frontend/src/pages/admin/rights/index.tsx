import { EditUserRights } from '../../../components/admin/EditUserRights'
import MainLayout from '../../../components/layouts/MainLayout'
import { useRights } from '../../../hooks/useRights'

export const AdminRights = () => {
    useRights('all', ['RIGHTS_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <EditUserRights />
            </div>
        </MainLayout>
    )
}

export default AdminRights
