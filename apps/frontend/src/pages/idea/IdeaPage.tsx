import { observer } from 'mobx-react-lite'
import { AppStore } from '../../globalStores/AppStore'
import Idea from './Idea'
import { Masonry } from '@mui/lab'
import { SimpleModalStore } from '../../reusableComponents/modal/SimpleModalStore'
import { useMemo } from 'react'
import { SimpleModal } from '../../reusableComponents/modal/SimpleModal'
import { IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CreateIdeaModal from './CreateIdeaModal'

const IdeaPage = observer(() => {
    const modalStore = useMemo(() => new SimpleModalStore(), [])

    const { ideaStore, authStore } = AppStore

    return (
        <>
            <IconButton onClick={() => modalStore.setModalOpen(true)}>
                <AddIcon />
            </IconButton>
            <Masonry columns={5} spacing={3}>
                {ideaStore.ideas.map((idea) => (
                    <Idea key={idea.id} idea={idea} userId={authStore.user.id} />
                ))}
            </Masonry>
            <SimpleModal open={modalStore.modalOpen} onClose={() => modalStore.setModalOpen(false)}>
                <CreateIdeaModal />
            </SimpleModal>
        </>
    )
})

export default IdeaPage
