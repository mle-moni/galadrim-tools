import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../globalStores/AppStore'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import { PasswordInput } from '../login/PasswordInput'

export const ChangePassword = observer(() => {
    const { authStore } = AppStore

    return (
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    authStore.changePassword()
                }}
            >
                <PasswordInput />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!authStore.canChangePassword}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Changer le mot de passe
                </Button>
                <CustomLink to="/">
                    <BackIcon /> Retour à l'accueil
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    )
})
