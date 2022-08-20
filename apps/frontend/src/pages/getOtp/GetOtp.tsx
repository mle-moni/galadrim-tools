import MailIcon from '@mui/icons-material/AlternateEmail'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../globalStores/AppStore'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import { TextInputWithIcon } from '../../reusableComponents/form/TextInputWithIcon'

export const GetOtp = observer(() => {
    const { authStore } = AppStore

    return (
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    authStore.getOtp()
                }}
            >
                <TextInputWithIcon
                    value={authStore.email}
                    onChange={(value) => authStore.setEmail(value)}
                    placeholder="Adresse e-mail"
                    Icon={MailIcon}
                />
                <Button fullWidth variant="contained" type="submit" size="large" sx={{ my: 2 }}>
                    Réinitialiser mon mot de passe
                </Button>
                <CustomLink to="/login">
                    <BackIcon /> Revenir à la page de connexion
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    )
})
