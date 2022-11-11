import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import { AppStore } from '../../globalStores/AppStore'
import { WhoamiStore } from './WhoamiStore'

export const Whoami = () => {
    const { authStore } = AppStore
    const store = new WhoamiStore()

    return (
        <Stack display="flex" direction="column" alignItems="center">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    AppStore.navigate('/profile')
                }}
            >
                <Avatar
                    alt={authStore.user.username}
                    src={authStore.user.imageUrl}
                    sx={{ width: 56, height: 56, mb: 1 }}
                />
                <Typography
                    variant="caption"
                    fontSize={16}
                    onClick={() => store.onClick()}
                    gutterBottom
                >
                    {authStore.user.username}
                </Typography>
            </Box>
            <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => authStore.logout()}
            >
                Déconnexion
            </Button>
        </Stack>
    )
}
