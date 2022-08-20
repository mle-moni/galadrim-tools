import { Box, Fab, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { AppStore } from '../../globalStores/AppStore'
import { LinkInfo } from './RoundedLinks'

export type IconLinkProps = LinkInfo & { title: string }

export const IconLink = observer<IconLinkProps>(({ Icon, link, title, hidden }) => {
    const handleClick = (link: string) => {
        if (link.includes('http')) {
            window.open(link)
            return
        }
        AppStore.navigate(link)
    }

    if (hidden) {
        return null
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" minWidth={200} p={4}>
            <Fab size="large" variant="circular" color="primary" onClick={() => handleClick(link)}>
                <Icon />
            </Fab>
            <Typography sx={{ mt: 2 }}>{title}</Typography>
        </Box>
    )
})
