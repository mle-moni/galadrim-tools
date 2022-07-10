import { AdminPanelSettings, Fastfood } from '@mui/icons-material'
import StatsIcon from '@mui/icons-material/QueryStats'
import { Box, Button, Fab, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { CenteredDiv } from '../components/cssHelpers/CenteredDiv'
import MainLayout from '../components/layouts/MainLayout'
import { WorkplaceSvg } from '../components/WorkplaceSvg/WorkplaceSvg'
import { WorkplaceWorkersSvg } from '../components/WorkplaceSvg/WorkplaceWorkersSvg'
import { useRights } from '../hooks/useRights'
import { useWindowDimensions } from '../hooks/useWindowDimensions'
import { AppStore } from '../stores/AppStore'
import { HomePageStore } from './HomePageStore'

const HomePage = observer(() => {
    const homePageStore = useMemo(() => new HomePageStore(), [])

    useEffect(() => {
        AppStore.eventsStore.setRoomName('')

        return () => homePageStore.cleanup()
    }, [])

    const { width, height } = useWindowDimensions()
    const shortestEdge = width < height ? width : height
    const svgSize = Math.round(shortestEdge * 0.8)

    const canSeeAdminPage = useRights('some', ['EVENT_ADMIN', 'RIGHTS_ADMIN', 'USER_ADMIN'])

    return (
        <MainLayout fullscreen>
            <Fab
                size="medium"
                variant="circular"
                color="primary"
                onClick={() => AppStore.navigate('/statistics')}
                sx={{
                    position: 'absolute',
                    top: 32,
                    left: 32,
                }}
            >
                <StatsIcon />
            </Fab>
            <Fab
                size="medium"
                variant="circular"
                color="primary"
                onClick={() => AppStore.navigate('/saveur')}
                sx={{
                    position: 'absolute',
                    top: 96,
                    left: 32,
                }}
            >
                <Fastfood />
            </Fab>
            {canSeeAdminPage && (
                <Fab
                    size="medium"
                    variant="circular"
                    color="primary"
                    onClick={() => AppStore.navigate('/admin')}
                    sx={{
                        position: 'absolute',
                        top: 160,
                        left: 32,
                    }}
                >
                    <AdminPanelSettings />
                </Fab>
            )}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Button
                    size="large"
                    variant="contained"
                    onClick={() => AppStore.navigate('/room')}
                    sx={{
                        mt: -3.5,
                    }}
                >
                    Voir toutes les salles
                </Button>
            </Box>
            <CenteredDiv>
                <WorkplaceSvg
                    width={svgSize}
                    height={svgSize}
                    onClick={(room) => homePageStore.onClick(room)}
                    backgroundColor={(room) => homePageStore.getRoomColor(room)}
                    backgroundColorHover={(room) => homePageStore.getRoomMouseOverColor(room)}
                    onMouseOut={() => homePageStore.onMouseOut()}
                    key={homePageStore.svgKey}
                />
                <WorkplaceWorkersSvg
                    width={svgSize}
                    height={svgSize}
                    getUserPictureUrl={(room) => homePageStore.getRoomUser(room)}
                />
            </CenteredDiv>
            <Typography
                variant="h5"
                style={{
                    transition: 'all 1s',
                    color: homePageStore.focusedRoomName ? 'black' : 'rgba(0,0,0,0)',
                    textAlign: 'center',
                }}
            >
                {homePageStore.focusedRoomName ?? (
                    <span style={{ visibility: 'hidden' }}>____</span>
                )}
            </Typography>
        </MainLayout>
    )
})

export default HomePage
