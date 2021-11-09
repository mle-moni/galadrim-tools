import { Button } from '@mui/material'
import { AppStore } from '../../stores/AppStore'

export const Whoami = () => {
    const { authStore } = AppStore

    return (
        <>
            <Button onClick={() => authStore.logout()}>Se déconnecter</Button>
            <p style={{ textAlign: 'center' }}>{authStore.user.username}</p>
        </>
    )
}
