import { Home } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import { useRights } from '../../../hooks/useRights'
import { RoundedLinks } from '../../../reusableComponents/common/RoundedLinks'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'
import { GalaguerreCardForm } from './GalaguerreCardForm'
import { useCardForm } from './useCardForm'

export const GalaguerreCreationPage = observer(() => {
    const formData = useCardForm()

    useRights('all', ['GALAGUERRE_ADMIN'], '/admin')

    return (
        <MainLayout fullscreen>
            <RoundedLinks linkInfos={[{ Icon: Home, link: '/' }]} />

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GalaguerreCardForm formData={formData} mode="create" />
            </div>
        </MainLayout>
    )
})

export default GalaguerreCreationPage
