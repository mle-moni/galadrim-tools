import { Box } from '@mui/material'
import { observer } from 'mobx-react'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppStore } from '../../stores/AppStore'
import { Whoami } from '../auth/Whoami'

const MainLayout: FC = ({ children }) => {
    const navigate = useNavigate()
    const { authStore } = AppStore

    useEffect(() => {
        AppStore.setNavigation(navigate)
    }, [])

    useEffect(() => {
        if (!authStore.connected) navigate('/login')
    }, [authStore.connected])

    return (
        <div
            className="flex h-100 flex-column justify-center align-center"
            style={{ boxSizing: 'border-box' }}
        >
            <div style={{ width: '100%' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 10,
                    }}
                >
                    {authStore.connected ? <Whoami /> : <></>}
                </Box>
                {children}
            </div>
        </div>
    )
}

export default observer(MainLayout)
