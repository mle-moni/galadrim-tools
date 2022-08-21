import {
    AdminPanelSettings,
    CalendarMonth,
    GitHub,
    Lightbulb,
    RestaurantMenu,
} from '@mui/icons-material'
import { Box } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useRights } from '../hooks/useRights'
import { IconLink } from '../reusableComponents/common/IconLink'
import MainLayout from '../reusableComponents/layouts/MainLayout'

const HomePage = observer(() => {
    const canSeeAdminPage = useRights('some', ['EVENT_ADMIN', 'RIGHTS_ADMIN', 'USER_ADMIN'])

    return (
        <MainLayout fullscreen>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    flexWrap: 'wrap',
                }}
            >
                <IconLink Icon={CalendarMonth} link="/rooms" title="Réservation de salles" />
                <IconLink Icon={RestaurantMenu} link="/saveur" title="Restaurants" />
                <IconLink
                    Icon={GitHub}
                    link="https://github.com/mle-moni/galadrim-tools"
                    title="Participer"
                />
                <IconLink
                    Icon={Lightbulb}
                    link="https://github.com/mle-moni/galadrim-tools/issues"
                    title="Nouvelle idée"
                />
                <IconLink
                    Icon={AdminPanelSettings}
                    link="/admin"
                    title="Administration"
                    hidden={!canSeeAdminPage}
                />
            </Box>
        </MainLayout>
    )
})

export default HomePage
