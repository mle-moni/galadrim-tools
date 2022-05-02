import { Typography } from '@mui/material'
import { GaladrimLogo } from '../../../components/Branding/GaladrimLogo'
import { Card } from '../../../components/Core/Card'
import { CenteredDiv } from '../../../components/cssHelpers/CenteredDiv'
import MainLayout from '../../../components/layouts/MainLayout'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { CustomLink } from '../../../components/Core/CustomLink'

const NotFoundPage = () => {
    return (
        <MainLayout fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
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
                </Card>
            </div>
        </MainLayout>
    )
}

export default NotFoundPage
