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
            {ideaStore.notBadIdeas.length > 0 && (
                <CenteredDiv>
                    <Masonry sx={{ width: '80%' }} columns={isMobile ? 1 : 5} spacing={3}>
                        {ideaStore.notBadIdeas.map((idea) => (
                            <Idea key={idea.id} idea={idea} userId={authStore.user.id} />
                        ))}
                    </Masonry>
                </CenteredDiv>
            )}
            {ideaStore.notBadIdeas.length > 0 && ideaStore.badIdeas.length > 0 && (
                <CenteredDiv>
                    <Divider orientation="horizontal" sx={{ width: '80%' }} />
                </CenteredDiv>
            )}
            {ideaStore.badIdeas.length > 0 && (
                <CenteredDiv style={{ marginTop: 25 }}>
                    <Masonry sx={{ width: '80%' }} columns={isMobile ? 1 : 5} spacing={3}>
                        {ideaStore.badIdeas.map((idea) => (
                            <Idea key={idea.id} idea={idea} userId={authStore.user.id} isBad />
                        ))}
                    </Masonry>
                </CenteredDiv>
            )}
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
