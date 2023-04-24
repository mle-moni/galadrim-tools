import { Lightbulb } from '@mui/icons-material'
import { Box, Button, Checkbox, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { TextInputWithIcon } from '../../reusableComponents/form/TextInputWithIcon'
import { CreateIdeaCallback, CreateIdeaStore } from './createIdea/CreateIdeaStore'
import { useIsMobile } from '../../hooks/useIsMobile'

const CreateIdeaModal = observer<{ onPublish: CreateIdeaCallback }>(({ onPublish }) => {
    const ideaStore = useMemo(() => new CreateIdeaStore(), [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        ideaStore.createIdea(onPublish)
    }

    return (
        <form onSubmit={handleSubmit}>
            <TextInputWithIcon
                value={ideaStore.text.text}
                placeholder={'Quelle est ton idée ?'}
                Icon={Lightbulb}
                onChange={(idea) => ideaStore.text.setText(idea)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Checkbox
                    checked={ideaStore.isAnonymous.checked}
                    value={ideaStore.isAnonymous}
                    onChange={(event) => ideaStore.isAnonymous.setChecked(event.target.checked)}
                    sx={{ padding: 0 }}
                />
                <Typography sx={{ marginLeft: 1 }}>Publier en anonyme</Typography>
            </Box>
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
