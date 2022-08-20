import { Home } from '@mui/icons-material'
import StatsIcon from '@mui/icons-material/QueryStats'
import { Box, Button, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { RoundedLinks } from '../../reusableComponents/common/RoundedLinks'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { WorkplaceSvg } from '../../reusableComponents/WorkplaceSvg/WorkplaceSvg'
import { WorkplaceWorkersSvg } from '../../reusableComponents/WorkplaceSvg/WorkplaceWorkersSvg'
import { RoomsHomePageStore } from './RoomsHomePageStore'

const RoomsHomePage = observer(() => {
    const homePageStore = useMemo(() => new RoomsHomePageStore(), [])

    useEffect(() => {
        AppStore.eventsStore.setRoomName('')

        return () => homePageStore.cleanup()
    }, [])

    const { width, height } = useWindowDimensions()
    const shortestEdge = width < height ? width : height
    const svgSize = Math.round(shortestEdge * 0.8)

    return (
        <MainLayout fullscreen>
            <RoundedLinks
                linkInfos={[
                    { Icon: Home, link: '/' },
                    { Icon: StatsIcon, link: '/rooms/statistics' },
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

export default RoomsHomePage
