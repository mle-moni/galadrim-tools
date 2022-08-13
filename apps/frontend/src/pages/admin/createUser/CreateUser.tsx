import { Mail, Person } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button, InputAdornment, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
import { CreateUserStore } from './CreateUserStore'

export const CreateUser = observer(() => {
    const createUserStore = useMemo(() => new CreateUserStore(), [])

    return (
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    createUserStore.createUser()
                }}
            >
                <OutlinedInput
                    value={createUserStore.email}
                    onChange={(e) => {
                        createUserStore.setEmail(e.target.value)
                    }}
                    fullWidth
                    placeholder="Adresse e-mail"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <Mail />
                        </InputAdornment>
                    }
                />
                <OutlinedInput
                    value={createUserStore.username}
                    onChange={(e) => {
                        createUserStore.setUsername(e.target.value)
                    }}
                    fullWidth
                    placeholder="Nom d'utilisateur"
                    startAdornment={
                        <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                            <Person />
                        </InputAdornment>
                    }
                    sx={{ mt: 2 }}
                />
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!createUserStore.canCreateUser}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Créer un utilisateur
                </Button>
                <CustomLink to="/admin">
                    <BackIcon /> Retour à la page d'administration
                </CustomLink>
            </form>
        </GaladrimRoomsCard>
    )
})
