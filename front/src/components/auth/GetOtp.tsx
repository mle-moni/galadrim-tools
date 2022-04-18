import MailIcon from '@mui/icons-material/AlternateEmail'
import { Button, InputAdornment, Link as MuiLink, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import { AppStore } from '../../stores/AppStore'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'

export const GetOtp = observer(() => {
    const { authStore } = AppStore

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    authStore.getOtp()
                }}
            >
                <OutlinedInput
                    value={authStore.email}
                    onChange={(e) => {
                        authStore.setEmail(e.target.value)
                    }}
                    fullWidth
                    placeholder="Adresse e-mail"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <MailIcon />
                        </InputAdornment>
                    }
                />
                <Button fullWidth variant="contained" type="submit" size="large" sx={{ my: 2 }}>
                    Réinitialiser mon mot de passe
                </Button>
                <MuiLink component={Link} to="/login">
                    Revenir à la page de connexion
                </MuiLink>
            </form>
        </Card>
    )
})
