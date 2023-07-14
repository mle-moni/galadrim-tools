import { Home, OpenInNew } from '@mui/icons-material'
import { Box, CircularProgress } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppStore } from '../../globalStores/AppStore'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../reusableComponents/common/GaladrimButton'
import { RoundedLinks } from '../../reusableComponents/common/RoundedLinks'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { GalabreakVotes } from './GalabreakVotes'

export const GalabreakPage = observer(() => {
    const store = AppStore.galabreakStore

    useEffect(() => {
        store.fetchAll()
    }, [store])

    return (
        <MainLayout>
            <RoundedLinks linkInfos={[{ Icon: Home, link: '/' }]} />
            <h1 style={{ textAlign: 'center' }}>Galabreak</h1>
            <CenteredDiv>
                <Box sx={{ width: '80%' }}>
                    <CenteredDiv>
                        <Link to="/galabreak/vote">
                            <GaladrimButton endIcon={<OpenInNew />}>Voter</GaladrimButton>
                        </Link>
                    </CenteredDiv>

                    {store.isLoading && <CircularProgress />}

                    {!store.isLoading && <GalabreakVotes />}
                </Box>
            </CenteredDiv>
        </MainLayout>
    )
})

export default GalabreakPage
