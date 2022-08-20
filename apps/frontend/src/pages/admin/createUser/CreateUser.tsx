import { Mail, Person } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
import { TextInputWithIcon } from '../../../reusableComponents/form/TextInputWithIcon'
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
                <TextInputWithIcon
                    value={createUserStore.email}
                    onChange={(value) => createUserStore.setEmail(value)}
                    placeholder="Adresse e-mail"
                    Icon={Mail}
                />
                <TextInputWithIcon
                    value={createUserStore.username}
                    onChange={(value) => createUserStore.setUsername(value)}
                    placeholder="Nom d'utilisateur"
                    Icon={Person}
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
