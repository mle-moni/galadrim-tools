import { IIdea } from '@galadrim-tools/shared'
import { Lightbulb } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Masonry } from '@mui/lab'
import { Box, Divider, Tab, Tabs, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import { useCheckConnection } from '../../hooks/useCheckConnection'
import { useIsMobile } from '../../hooks/useIsMobile'
import { RenouvArtWait } from '../../reusableComponents/animations/RenouvArtWait/RenouvArtWait'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../reusableComponents/common/GaladrimButton'
import { RoundedLinks } from '../../reusableComponents/common/RoundedLinks'
import { SimpleModal } from '../../reusableComponents/modal/SimpleModal'
import { SimpleModalStore } from '../../reusableComponents/modal/SimpleModalStore'
import CreateIdeaModal from './CreateIdeaModal'
import Idea from './Idea'

const DisplayIdeas = observer<{ ideas: IIdea[]; isBad?: boolean }>(({ ideas, isBad }) => {
    const { authStore } = AppStore
    const isMobile = useIsMobile()
    return (
        <CenteredDiv>
            <Masonry sx={{ width: '80%', marginBottom: 0 }} columns={isMobile ? 1 : 5} spacing={3}>
                {ideas.map((idea) => (
                    <Idea key={idea.id} idea={idea} user={authStore.user} isBad={isBad} />
                ))}
            </Masonry>
        </CenteredDiv>
    )
})

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

const TabPanel = observer<TabPanelProps>(({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index} style={{ marginTop: 20 }}>
            {value === index && <>{children}</>}
        </div>
    )
})

const IdeaPage = observer(() => {
    const [tab, setTab] = useState<0 | 1 | 2 | 3>(0)
    const modalStore = useMemo(() => new SimpleModalStore(), [])

    const { ideaStore, authStore } = AppStore

    useEffect(() => {
        if (!ideaStore.loadingState.isLoading) {
            ideaStore.fetchIdeaList()
        }
    }, [])

    useCheckConnection(authStore)

    const ideasByState = ideaStore.ideasByState

    const states: {
        label: string
        message: string
        value: keyof typeof ideasByState
    }[] = [
        { label: 'A faire', message: 'à faire', value: 'todo' },
        { label: 'En cours', message: 'en cours', value: 'doing' },
        { label: 'Terminées', message: 'terminée', value: 'done' },
        { label: 'Refusées', message: 'refusée', value: 'refused' },
    ]

    return (
        <>
            <RoundedLinks linkInfos={[{ Icon: BackIcon, link: '/' }]} />
            <Typography style={{ textAlign: 'center', fontSize: 32, paddingTop: 30 }}>
                Proposer une idée pour améliorer Galadrim
            </Typography>

            <CenteredDiv>
                <GaladrimButton
                    sx={{ my: 2 }}
                    fullWidth={false}
                    startIcon={<Lightbulb />}
                    onClick={() => modalStore.setModalOpen(true)}
                >
                    J'ai une idée !
                </GaladrimButton>
            </CenteredDiv>
            <Tabs centered variant="fullWidth" value={tab} onChange={(_event, tab) => setTab(tab)}>
                {states.map(({ value, label }) => (
                    <Tab key={value} label={label} />
                ))}
            </Tabs>
            {states.map(({ value, message }, index) => (
                <TabPanel index={index} value={tab} key={index}>
                    {ideasByState[value].length > 0 ? (
                        <DisplayIdeas ideas={ideasByState[value]} />
                    ) : ideaStore.loadingState.isLoading ? (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <RenouvArtWait />
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Typography>Il n'y a aucune idée {message} pour le moment.</Typography>
                        </Box>
                    )}
                </TabPanel>
            ))}
            <SimpleModal open={modalStore.modalOpen} onClose={() => modalStore.setModalOpen(false)}>
                <CreateIdeaModal
                    onPublish={() => {
                        modalStore.setModalOpen(false)
                    }}
                />
            </SimpleModal>
        </>
    )
})

export default IdeaPage
