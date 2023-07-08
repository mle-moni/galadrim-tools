import { useRights } from '../../../hooks/useRights'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'

export const GalaguerreAdminPage = () => {
    useRights('all', ['GALAGUERRE_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>TODO</h1>
            </div>
        </MainLayout>
    )
}

export default GalaguerreAdminPage
