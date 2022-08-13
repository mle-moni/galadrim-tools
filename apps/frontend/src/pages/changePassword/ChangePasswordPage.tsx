import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { ChangePassword } from './ChangePassword'

export const ChangePasswordPage = () => (
    <MainLayout fullscreen>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChangePassword />
        </div>
    </MainLayout>
)

export default ChangePasswordPage
