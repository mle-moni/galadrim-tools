import { Visibility, VisibilityOff } from '@mui/icons-material'
import PasswordIcon from '@mui/icons-material/VpnKey'
import { IconButton, InputAdornment, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { AppStore } from '../../globalStores/AppStore'

export const PasswordInput = observer(() => {
    const { authStore } = AppStore
    const [showPassword, setShowPassword] = useState(false)

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
    }

    return (
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
    )
})
