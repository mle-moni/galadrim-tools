import { useIsMobile } from '../../../hooks/useIsMobile'
import { useRights } from '../../../hooks/useRights'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'

export const GalaguerreAdminPage = () => {
    const isMobile = useIsMobile()
    useRights('all', ['GALAGUERRE_ADMIN'], '/admin')

    return (
        <MainLayout>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: isMobile ? '100%' : '80%' }}>
                    <h1>Créer une carte</h1>
                    <p>test</p>
                </div>
            </div>
        </MainLayout>
    )
}

export default GalaguerreAdminPage
