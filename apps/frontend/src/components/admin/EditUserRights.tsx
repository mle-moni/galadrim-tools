import BackIcon from '@mui/icons-material/ChevronLeft'
import { Alert } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'

export const EditUserRights = observer(() => {
    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <Alert sx={{ my: 2 }} severity="warning">
                Work in progress
            </Alert>
            <CustomLink to="/admin">
                <BackIcon /> Retour à la page d'administration
            </CustomLink>
        </Card>
    )
})
