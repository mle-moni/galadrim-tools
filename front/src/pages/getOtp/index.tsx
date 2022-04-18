import { GetOtp } from '../../components/auth/GetOtp'
import MainLayout from '../../components/layouts/MainLayout'

export const GetOtpPage = () => (
    <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GetOtp />
        </div>
    </MainLayout>
)

export default GetOtpPage
