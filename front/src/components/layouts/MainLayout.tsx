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
            style={{ boxSizing: 'border-box', padding: '0px 50px 10px' }}
        >
            <div style={{ width: '100%' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        right: '10px',
                        zIndex: 10,
                        top: {
                            xs: undefined,
                            md: '10px',
                        },
                        bottom: {
                            xs: '10px',
                            md: undefined,
                        },
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
