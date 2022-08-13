import { useRights } from '../../../hooks/useRights'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { CreateUser } from './CreateUser'

export const CreateUserPage = () => {
    useRights('all', ['USER_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CreateUser />
            </div>
        </MainLayout>
    )
}

export default CreateUserPage
