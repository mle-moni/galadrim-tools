import { AdminPanelSettings, Fastfood } from '@mui/icons-material'
import StatsIcon from '@mui/icons-material/QueryStats'
import { Box, Button, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { AppStore } from '../globalStores/AppStore'
import { useRights } from '../hooks/useRights'
import { useWindowDimensions } from '../hooks/useWindowDimensions'
import { CenteredDiv } from '../reusableComponents/cssHelpers/CenteredDiv'
import { RoundedLinks } from '../reusableComponents/cssHelpers/RoundedLinks'
import MainLayout from '../reusableComponents/layouts/MainLayout'
import { WorkplaceSvg } from '../reusableComponents/WorkplaceSvg/WorkplaceSvg'
import { WorkplaceWorkersSvg } from '../reusableComponents/WorkplaceSvg/WorkplaceWorkersSvg'
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
            <RoundedLinks
                linkInfos={[
                    { Icon: StatsIcon, link: '/statistics' },
                    { Icon: Fastfood, link: '/saveur' },
                    { Icon: AdminPanelSettings, link: '/admin', hidden: !canSeeAdminPage },
                ]}
            />
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
