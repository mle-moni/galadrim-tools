import { CreateUser } from '../../../components/admin/CreateUser'
import MainLayout from '../../../components/layouts/MainLayout'

export const CreateUserPage = () => (
    <MainLayout fullscreen>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CreateUser />
        </div>
    </MainLayout>
)

export default CreateUserPage
