import { Box, experimental_sx as sx, styled, Stack } from '@mui/material'
import { PropsWithChildren, useMemo } from 'react'
import './rewindPage.css'
import { RewindStore } from '../../../globalStores/RewindStore'
import { observer } from 'mobx-react-lite'
import { CategoryInfo } from './components/CategoryInfo'
import { TimerSlides } from '../../../reusableComponents/common/TimerSlides'
import { FirstSlide } from './slides/FirstSlide'
import { FifthSlide } from './slides/FifthSlide'
import { SixthSlide } from './slides/SixthSlide'
import { SeventhSlide } from './slides/SeventhSlide'
import WithRibbons from '../../../reusableComponents/animations/rewind/WithRibbons'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { Home } from '@mui/icons-material'

type MainLayoutProps = PropsWithChildren<{
    fullscreen?: boolean
}>

export const RewindRoot = styled(Box, {
    shouldForwardProp: (propName: string) => propName !== 'fullscreen',
})<MainLayoutProps>(({ fullscreen }) =>
    sx({
        display: 'flex',
        minHeight: fullscreen ? '100vh' : 'auto',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        backgroundColor: '#F0FFF1',
    })
)

const RewindPage = observer(() => {
    const userRewindStore = useMemo(() => {
        const rewindStore = new RewindStore()
        rewindStore.fetch()
        return rewindStore
    }, [])

    const childrens = useMemo(
        () => [
            {
                component: <FirstSlide />,
                duration: 4000,
            },
            ...(userRewindStore.rewindPositionsInfos || []).map((info) => ({
                component: <CategoryInfo {...info} key={info.label} />,
                duration: info.duration ?? 6000,
                key: info.label,
            })),
            {
                component: <FifthSlide rewindStore={userRewindStore} />,
                duration: 10000,
            },
            { component: <SixthSlide rewindStore={userRewindStore} />, duration: 14000 },
            { component: <SeventhSlide rewindStore={userRewindStore} />, duration: Infinity },
        ],
        [userRewindStore.loadingState.isLoading]
    )

    return (
        <RewindRoot fullscreen>
            <CustomLink to="/saveur" style={{ position: 'absolute', left: 10, top: 10, zIndex: 6 }}>
                <Home />
            </CustomLink>
            <WithRibbons>
                <TimerSlides slides={childrens} />
            </WithRibbons>
        </RewindRoot>
    )
})

export default RewindPage
