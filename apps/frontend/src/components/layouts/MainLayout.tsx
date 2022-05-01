import { Box, styled, experimental_sx as sx } from '@mui/material'
import { observer } from 'mobx-react'
import { FC, PropsWithChildren, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppStore } from '../../stores/AppStore'
import { getTheme } from '../../theme'
import { Whoami } from '../auth/Whoami'

const whiteListedRoutes = ['/login', '/getOtp']

type MainLayoutProps = PropsWithChildren<{
    fullscreen?: boolean;
}>

const Root = styled(Box)<MainLayoutProps>(({ fullscreen }) =>
    sx({
        display: 'flex',
        height: fullscreen ? '100vh' : 'auto',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        backgroundColor: fullscreen ? 'inherit' : getTheme().palette.background.default
    })
)

const MainLayout: FC<MainLayoutProps> = ({ fullscreen, children }) => {
    const navigate = useNavigate()
    const { authStore } = AppStore

    useEffect(() => {
        AppStore.setNavigation(navigate)
    }, [])

    useEffect(() => {
        if (!authStore.connected && !whiteListedRoutes.includes(location.pathname)) {
            navigate('/login')
        }
    }, [authStore.connected])

    return (
        <Root fullscreen={fullscreen}>
            <div style={{ width: '100%' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 32,
                        right: 32,
                        zIndex: 10,
                    }}
                >
                    {authStore.connected ? <Whoami /> : <></>}
                </Box>
                {children}
            </div>
        </Root>
    )
}

export default observer(MainLayout)
