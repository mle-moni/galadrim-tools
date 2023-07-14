import { Avatar, Box } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../globalStores/AppStore'
import { ApiBreakVote } from '../../globalStores/GalabreakStore'

const VoteUserAvatars = observer<{ votes: ApiBreakVote[] }>(({ votes }) => (
    <Box sx={{ display: 'flex', gap: 2 }}>
        {votes.map((vote) => {
            const user = AppStore.users.get(vote.userId)
            if (!user) return null

            return (
                <div key={vote.id} className="flex justify-center" style={{ marginTop: '24px' }}>
                    <Avatar
                        alt={user.username}
                        src={user.imageUrl ?? undefined}
                        sx={{ width: 64, height: 64, mb: 1 }}
                    />
                </div>
            )
        })}
    </Box>
))

const H2_STYLE = { marginRight: 20, minWidth: 200 }

const Activity = observer<{ activityId: number; votes: ApiBreakVote[] }>(
    ({ activityId, votes }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={H2_STYLE}>
                {votes[0].activities.find(({ id }) => id === activityId)?.name}
            </h2>
            <VoteUserAvatars votes={votes} />
        </Box>
    )
)

const getVoteTime = (vote: ApiBreakVote, timeId: number) => {
    const timeObj = vote.times.find(({ id }) => id === timeId)
    const timeStr = timeObj?.time.slice(0, 5).replace(':', 'h')
    return timeStr ?? '???'
}

const Time = observer<{ timeId: number; votes: ApiBreakVote[] }>(({ timeId, votes }) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={H2_STYLE}>{getVoteTime(votes[0], timeId)}</h2>
        <VoteUserAvatars votes={votes} />
    </Box>
))

export const GalabreakVotes = observer(() => {
    const store = AppStore.galabreakStore

    return (
        <Box>
            {store.activityVotes.map(([activityId, votes]) => (
                <Activity key={activityId} activityId={activityId} votes={votes} />
            ))}

            {store.timeVotes.map(([timeId, votes]) => (
                <Time key={timeId} timeId={timeId} votes={votes} />
            ))}
        </Box>
    )
})
