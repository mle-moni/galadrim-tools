import { IIdea } from '@galadrim-tools/shared'
import { Lightbulb } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Masonry } from '@mui/lab'
import { Box, Tab, Tabs, Typography } from '@mui/material'
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

export type IdeaPageStateValue = 'todo' | 'doing' | 'done' | 'refused' | 'you_should_not_pass'

const IDEA_PAGE_STATES: {
    label: string
    message: string
    value: IdeaPageStateValue
    isBad?: boolean
}[] = [
    { label: 'A faire 💤', message: 'à faire', value: 'todo' },
    { label: 'En cours 🚀', message: 'en cours', value: 'doing' },
    { label: 'Terminées ✅', message: 'terminée', value: 'done' },
    { label: 'Refusées 🚫', message: 'refusée', value: 'refused', isBad: true },
    // TODO show 'You shall not pass' only if user parameter allow it
    // {
    //     label: 'You shall not pass! 🧙‍♂️',
    //     message: 'you shall not pass',
    //     value: 'you_should_not_pass',
    // },
]

interface DisplayIdeasProps {
    state: typeof IDEA_PAGE_STATES[number]
}

const DisplayIdeas = observer<DisplayIdeasProps>(({ state }) => {
    const { authStore, ideaStore } = AppStore
    const isMobile = useIsMobile()

    const ideasByState = ideaStore.ideasByState
    const { value, message, isBad = false } = state
    const ideas = ideasByState[value]

    if (ideas.length > 0) {
        return (
            <CenteredDiv>
                <Masonry
                    sx={{ width: '80%', marginBottom: 0 }}
                    columns={isMobile ? 1 : 5}
                    spacing={3}
                >
                    {ideas.map((idea) => (
                        <Idea key={idea.id} idea={idea} user={authStore.user} isBad={isBad} />
                    ))}
                </Masonry>
            </CenteredDiv>
        )
    }
    if (ideaStore.loadingState.isLoading) {
        return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <RenouvArtWait />
            </Box>
        )
    }
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Typography>Il n'y a aucune idée {message} pour le moment.</Typography>
        </Box>
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
                {IDEA_PAGE_STATES.map(({ value, label }) => (
                    <Tab key={value} label={label} />
                ))}
            </Tabs>
            {IDEA_PAGE_STATES.map((state, index) => (
                <TabPanel index={index} value={tab} key={index}>
                    <DisplayIdeas state={state} />
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
