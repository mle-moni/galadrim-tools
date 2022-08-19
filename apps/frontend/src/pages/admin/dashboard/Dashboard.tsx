import { Box, CircularProgress, CircularProgressProps, styled, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { RenouvArtWait } from '../../../reusableComponents/animations/RenouvArtWait/RenouvArtWait'
import { DashboardStore } from './DashboardStore'

export interface DashboardElementProps {
    options: {
        label: string
        value: number
        maxValue: number
        unit: string
        color: CircularProgressProps['color']
    }
}

const DashboardElement = observer<DashboardElementProps>(
    ({ options: { value, label, maxValue, unit, color } }) => {
        const valuePercent = (value / maxValue) * 100

        return (
            <div>
                <div style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                            sx={{ position: 'absolute' }}
                            size="100px"
                            value={100}
                            variant="determinate"
                            color="secondary"
                        />
                        <CircularProgress
                            size="100px"
                            value={valuePercent}
                            variant="determinate"
                            color={color}
                        />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography
                                variant="caption"
                                component="div"
                                color="text.secondary"
                            >{`${value} ${unit}`}</Typography>
                        </Box>
                    </Box>
                    <Typography>{label}</Typography>
                </div>
            </div>
        )
    }
)

const flexCenterCss = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
} as const

const DashboardContainer = styled(Box)(({ theme }) => ({
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'flexWrap': 'wrap',
    '&> div': {
        ...flexCenterCss,
        margin: theme.spacing(6),
        flexBasis: '21%',
    },
    '&> div > div': {
        ...flexCenterCss,
        borderRadius: theme.shape.borderRadius,
        width: 200,
        height: 200,
        backgroundColor: 'white',
    },
}))

const DashboardUi = observer<{ dashboardStore: DashboardStore }>(({ dashboardStore }) => {
    if (dashboardStore.ready === false) {
        return <RenouvArtWait />
    }

    return (
        <DashboardContainer>
            <DashboardElement options={dashboardStore.memoryUsedInfos} />
            <DashboardElement options={dashboardStore.allMemoryInfos} />
            <DashboardElement options={dashboardStore.uptimeInfos} />
            <DashboardElement options={dashboardStore.load1MinInfos} />
            <DashboardElement options={dashboardStore.load5MinInfos} />
            <DashboardElement options={dashboardStore.load15MinInfos} />
        </DashboardContainer>
    )
})

export const Dashboard = observer(() => {
    const dashboardStore = useMemo(() => new DashboardStore(), [])

    useEffect(() => {
        dashboardStore.init()

        return () => {
            dashboardStore.cleanup()
        }
    }, [])

    return <DashboardUi dashboardStore={dashboardStore} />
})
