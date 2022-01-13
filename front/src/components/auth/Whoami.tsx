import { Button } from '@mui/material'
import { AppStore } from '../../stores/AppStore'
import { WhoamiStore } from './WhoamiStore'

export const Whoami = () => {
    const { authStore } = AppStore
    const store = new WhoamiStore()

    return (
        <>
            <Button onClick={() => authStore.logout()}>Se déconnecter</Button>
            <p onClick={() => store.onClick()} style={{ textAlign: 'center', userSelect: 'none' }}>
                {authStore.user.username}
            </p>
        </>
    )
}
