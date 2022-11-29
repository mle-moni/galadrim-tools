import { IIdea, IIdeaComment } from '@galadrim-tools/shared'
import { Send } from '@mui/icons-material'
import { Box, Button, OutlinedInput, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import 'moment/dist/locale/fr'
import { useEffect, useMemo, useRef } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import { CreateIdeaCommentStore } from './createIdea/CreateIdeaCommentStore'

moment.locale('fr')

const CommentDiv = observer<{
    comment: IIdeaComment
    userId: IIdeaComment['userId']
}>(({ comment, userId }) => {
    const { users } = AppStore
    const username = users.get(comment.userId)?.username
    const isSelf = comment.userId === userId

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSelf ? 'flex-end' : 'flex-start',
                paddingBottom: 1,
            }}
        >
            <Typography sx={{ color: 'gray' }}>
                {username} ( {moment(comment.createdAt).fromNow()} )
            </Typography>
            <Typography
                sx={{
                    paddingX: 2,
                    paddingY: 1,
                    backgroundColor: isSelf ? 'lightgray' : 'white',
                    borderRadius: 5,
                    textAlign: isSelf ? 'end' : 'start',
                    width: 'fit-content',
                    border: '1px solid #CECECE',
                }}
            >
                {comment.message}
            </Typography>
        </Box>
    )
})

const CommentIdeaModal = observer<{
    idea: IIdea
    userId: IIdeaComment['userId']
}>(({ idea, userId }) => {
    const ideaCommentStore = useMemo(() => new CreateIdeaCommentStore(idea.id, userId), [])
    const scrollCommentsRef = useRef()

    useEffect(() => {
        setTimeout(() => {
            scrollCommentsRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }, [scrollCommentsRef, idea.comments])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                ideaCommentStore.createIdeaComment()
                ideaCommentStore.message.setText('')
            }}
        >
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {idea.comments.map((comment, index) => {
                    return <CommentDiv comment={comment} userId={userId} key={index} />
                })}
                <Box key={'bottomRef'} ref={scrollCommentsRef} />
            </Box>
            <Box style={{ display: 'flex', flex: 1, alignItems: 'center', marginTop: 15 }}>
                <OutlinedInput
                    value={ideaCommentStore.message.text}
                    onChange={(e) => ideaCommentStore.message.setText(e.target.value)}
                    placeholder={'Laissez un commentaire..'}
                    sx={{ flex: 1, marginRight: 2 }}
                />
                <Button disabled={!ideaCommentStore.canCreateIdeaComment} type="submit">
                    <Send fontSize={'large'} />
                </Button>
            </Box>
        </form>
    )
})

export default CommentIdeaModal
