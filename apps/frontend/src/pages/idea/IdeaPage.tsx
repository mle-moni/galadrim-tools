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

const BAD_IDEA_DOWNVOTES_TRESHOLD = parseInt(
    import.meta.env.VITE_BAD_IDEA_DOWNVOTES_TRESHOLD ?? '80'
)

const IdeaPage = observer(() => {
    const modalStore = useMemo(() => new SimpleModalStore(), [])

    const { ideaStore, authStore } = AppStore

    const isMobile = useIsMobile()

    useEffect(() => {
        if (!ideaStore.loadingState.isLoading) {
            ideaStore.fetchIdeaList()
        }
    }, [])

    useCheckConnection(authStore)

    const displayIdeas = (ideas: IIdea[], greyed?: boolean) => (
        <CenteredDiv style={{ marginTop: 25 }}>
            <Masonry sx={{ width: '80%' }} columns={isMobile ? 1 : 5} spacing={3}>
                {ideas.map((idea) => (
                    <Idea key={idea.id} idea={idea} userId={authStore.user.id} greyed={greyed} />
                ))}
            </Masonry>
        </CenteredDiv>
    )

    const isBadIdea = (idea: IIdea) =>
        (idea.reactions.filter((reaction) => !reaction.isUpvote).length / idea.reactions.length) *
            100 >
        BAD_IDEA_DOWNVOTES_TRESHOLD

    const badIdeas = ideaStore.ideas.filter((idea) => isBadIdea(idea))
    const notBadIdeas = ideaStore.ideas.filter((idea) => !isBadIdea(idea))

    return (
        <>
            <Typography style={{ textAlign: 'center', fontSize: 32 }}>
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
            {displayIdeas(notBadIdeas)}
            <CenteredDiv>
                <Divider orientation="horizontal" sx={{ width: '80%' }} />
            </CenteredDiv>
            {displayIdeas(badIdeas, true)}
            <SimpleModal open={modalStore.modalOpen} onClose={() => modalStore.setModalOpen(false)}>
                <CreateIdeaModal
                    onPublish={(newIdea) => {
                        ideaStore.saveIdeaLocally(newIdea)
                        modalStore.setModalOpen(false)
                    }}
                />
            </SimpleModal>
        </>
    )
})

export default IdeaPage
