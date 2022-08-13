import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { GetOtp } from './GetOtp'

export const GetOtpPage = () => (
    <MainLayout fullscreen>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GetOtp />
        </div>
    </MainLayout>
)

export default GetOtpPage
