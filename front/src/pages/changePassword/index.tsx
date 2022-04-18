import { ChangePassword } from '../../components/auth/ChangePassword'
import MainLayout from '../../components/layouts/MainLayout'

export const ChangePasswordPage = () => (
    <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChangePassword />
        </div>
    </MainLayout>
)

export default ChangePasswordPage
