import MailIcon from '@mui/icons-material/AlternateEmail'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PasswordIcon from '@mui/icons-material/VpnKey'
import { Button, IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppStore } from '../../stores/AppStore'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'

export const Login = observer(() => {
    const { authStore } = AppStore

    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (authStore.connected) {
            navigate('/')
        }
    }, [])

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
                    authStore.login()
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
                    disabled={!authStore.canAuthenticate}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Se connecter
                </Button>
                <CustomLink to="/getOtp">Mot de passe oublié ?</CustomLink>
            </form>
        </Card>
    )
})
