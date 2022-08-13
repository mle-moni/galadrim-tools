import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { Login } from './Login'

const LoginPage = () => {
    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Login />
            </div>
        </MainLayout>
    )
}

export default LoginPage
