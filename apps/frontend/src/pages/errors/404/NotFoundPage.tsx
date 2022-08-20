import BackIcon from '@mui/icons-material/ChevronLeft'
import { Typography } from '@mui/material'
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CenteredDiv } from '../../../reusableComponents/common/CenteredDiv'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
import MainLayout from '../../../reusableComponents/layouts/MainLayout'

const NotFoundPage = () => {
    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
                    <GaladrimLogo align="center" sx={{ mb: 8 }} />
                    <Typography variant="h1" sx={{ textAlign: 'center', m: 5 }}>
                        404
                    </Typography>
                    <Typography variant="h2" sx={{ textAlign: 'center', m: 5 }}>
                        Page introuvable
                    </Typography>
                    <CenteredDiv>
                        <CustomLink to="/">
                            <BackIcon /> Retour à l'accueil
                        </CustomLink>
                    </CenteredDiv>
                </GaladrimRoomsCard>
            </div>
        </MainLayout>
    )
}

export default NotFoundPage
