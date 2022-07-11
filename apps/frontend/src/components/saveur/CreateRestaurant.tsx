import { Mail, Person } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button, InputAdornment, OutlinedInput } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'
import { CreateUserStore } from '../admin/CreateUserStore'

export const CreateRestaurant = observer(() => {
    const createUserStore = useMemo(() => new CreateUserStore(), [])

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
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
                    Ajouter le restaurant
                </Button>
                <CustomLink to="/admin">
                    <BackIcon /> Retour à la carte
                </CustomLink>
            </form>
        </Card>   
)
}) 
