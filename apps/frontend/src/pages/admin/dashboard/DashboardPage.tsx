import { AdminPanelSettings, Home } from '@mui/icons-material'
import { useRights } from '../../../hooks/useRights'
import { RoundedLinks } from '../../../reusableComponents/cssHelpers/RoundedLinks'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { Dashboard } from './Dashboard'

export const AdminRightsPage = () => {
    useRights('all', ['DASHBOARD_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <RoundedLinks
                linkInfos={[
                    { Icon: Home, link: '/' },
                    { Icon: AdminPanelSettings, link: '/admin' },
                ]}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Dashboard />
            </div>
        </MainLayout>
    )
}

export default AdminRightsPage
