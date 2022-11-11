import { Lightbulb } from '@mui/icons-material'
import { Button } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { TextInputWithIcon } from '../../reusableComponents/form/TextInputWithIcon'
import { CreateIdeaCallback, CreateIdeaStore } from './createIdea/CreateIdeaStore'

const CreateIdeaModal = observer<{ onPublish: CreateIdeaCallback }>(({ onPublish }) => {
    const ideaStore = useMemo(() => new CreateIdeaStore(), [])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                ideaStore.createIdea(onPublish)
            }}
        >
            <TextInputWithIcon
                value={ideaStore.text.text}
                placeholder={'Quelle est ton idée ?'}
                Icon={Lightbulb}
                onChange={(idea) => ideaStore.text.setText(idea)}
            />
            <Button
                fullWidth
                variant="contained"
                disabled={!ideaStore.canCreateIdea}
                type="submit"
                size="large"
                sx={{ my: 2 }}
            >
                Publier mon idée
            </Button>
        </form>
    )
})

export default CreateIdeaModal
