import {
    Box,
    CardContent,
    LinearProgress,
    linearProgressClasses,
    styled,
    Tooltip,
    Typography,
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../../globalStores/AppStore'
import { getNameOfUsers } from './ratingsFunctions'
import { Ratio } from './RestaurantCardStore'

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    width: '40%',
    padding: '0px !important',
    paddingTop: `${theme.spacing(2)} !important`,
}))

const RatioWrapper = styled(Box)({
    display: 'flex',
    alignItems: 'center',
})

const ProgressWrapper = styled(Box)(({ theme }) => ({ width: '100%', padding: theme.spacing(1) }))

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[200],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: '#1a90ff',
    },
}))

type RatingsProps = {
    ratios: Ratio[]
}

const Ratings = observer<RatingsProps>(({ ratios }) => {
    return (
        <StyledCardContent>
            {ratios.map((ratio) => (
                <RatioWrapper key={ratio.id}>
                    <Typography>{ratio.label}</Typography>
                    <ProgressWrapper>
                        <Tooltip title={getNameOfUsers(ratio.userIds, AppStore.users)}>
                            <BorderLinearProgress variant="determinate" value={ratio.value} />
                        </Tooltip>
                    </ProgressWrapper>
                    <Typography sx={{ fontSize: 10 }}>{ratio.count}</Typography>
                </RatioWrapper>
            ))}
        </StyledCardContent>
    )
})

export default Ratings
