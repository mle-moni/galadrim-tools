import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { CenteredDiv } from '../components/cssHelpers/CenteredDiv'
import MainLayout from '../components/layouts/MainLayout'
import { WorkplaceSvg } from '../components/WorkplaceSvg/WorkplaceSvg'
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

    return (
        <MainLayout>
            <CenteredDiv>
                <Button
                    size="large"
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        bottom: {
                            sm: undefined,
                            md: '40px',
                        },
                    }}
                    onClick={() => AppStore.navigate('/room')}
                >
                    Voir toutes les salles
                </Button>
            </CenteredDiv>
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
            </CenteredDiv>
        </MainLayout>
    )
})

export default HomePage
