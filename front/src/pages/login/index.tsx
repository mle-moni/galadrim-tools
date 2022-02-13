import { Login } from '../../components/auth/Login'
import MainLayout from '../../components/layouts/MainLayout'

const LoginPage = () => {
    return (
        <MainLayout>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Login />
            </div>
        </MainLayout>
    )
}

export default LoginPage
