import { IIdea } from '@galadrim-tools/shared'
import { Lightbulb } from '@mui/icons-material'
import { Masonry } from '@mui/lab'
import { Divider, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import { useCheckConnection } from '../../hooks/useCheckConnection'
import { useIsMobile } from '../../hooks/useIsMobile'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../reusableComponents/common/GaladrimButton'
import { SimpleModal } from '../../reusableComponents/modal/SimpleModal'
import { SimpleModalStore } from '../../reusableComponents/modal/SimpleModalStore'
import CreateIdeaModal from './CreateIdeaModal'
import Idea from './Idea'

const DisplayIdeas = observer<{ ideas: IIdea[]; isBad?: boolean }>(({ ideas, isBad }) => {
    const { authStore } = AppStore
    const isMobile = useIsMobile()
    return (
        <CenteredDiv>
            <Masonry sx={{ width: '80%' }} columns={isMobile ? 1 : 5} spacing={3}>
                {ideas.map((idea) => (
                    <Idea key={idea.id} idea={idea} user={authStore.user} isBad={isBad} />
                ))}
            </Masonry>
        </CenteredDiv>
    )
})

const IdeaPage = observer(() => {
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
            {ideaStore.notBadIdeas.length > 0 && <DisplayIdeas ideas={ideaStore.notBadIdeas} />}
            {ideaStore.notBadIdeas.length > 0 && ideaStore.badIdeas.length > 0 && (
                <CenteredDiv style={{ marginBottom: 25 }}>
                    <Divider orientation="horizontal" sx={{ width: '80%' }} />
                </CenteredDiv>
            )}
            {ideaStore.badIdeas.length > 0 && <DisplayIdeas ideas={ideaStore.badIdeas} isBad />}
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
