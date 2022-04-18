import { Link as MuiLink, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { GaladrimLogo } from '../../../components/Branding/GaladrimLogo'
import { Card } from '../../../components/Core/Card'
import { CenteredDiv } from '../../../components/cssHelpers/CenteredDiv'
import MainLayout from '../../../components/layouts/MainLayout'

const NotFoundPage = () => {
    return (
        <MainLayout>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
                    <GaladrimLogo align="center" sx={{ mb: 8 }} />
                    <Typography variant="h2" sx={{ textAlign: 'center', m: 5 }}>
                        Page introuvable
                    </Typography>
                    <CenteredDiv>
                        <MuiLink component={Link} to="/">
                            Revenir à l'accueil
                        </MuiLink>
                    </CenteredDiv>
                </Card>
            </div>
        </MainLayout>
    )
}

export default NotFoundPage
