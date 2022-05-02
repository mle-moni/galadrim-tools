import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PasswordIcon from '@mui/icons-material/VpnKey'
import { Button, IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { AppStore } from '../../stores/AppStore'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'
import BackIcon from '@mui/icons-material/ChevronLeft'

export const ChangePassword = observer(() => {
    const { authStore } = AppStore
    const [showPassword, setShowPassword] = useState(false)

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    authStore.changePassword()
                }}
            >
                <OutlinedInput
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={authStore.password}
                    onChange={(e) => authStore.setPassword(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start" sx={{ mr: 1.8 }}>
                            <PasswordIcon />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end" sx={{ mr: 0.5 }}>
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
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
        </Card>
    )
})
