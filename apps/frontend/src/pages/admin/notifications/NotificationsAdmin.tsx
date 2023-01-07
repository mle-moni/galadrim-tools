import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
import { NotificationsAdminStore } from './NotificationsAdminStore'

export const NotificationsAdmin = observer(() => {
    const createUserStore = useMemo(() => new NotificationsAdminStore(), [])

    return (
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    createUserStore.createNotification()
                }}
            >
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!createUserStore.canCreateNotification}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Créer une notification
                </Button>
                <CustomLink to="/admin">
                    <BackIcon /> Retour à la page d'administration
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    )
})
