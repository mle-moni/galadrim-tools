import { NotesOption, NOTES_VALUES } from '@galadrim-tools/shared'
import { CardContent, IconButton, styled } from '@mui/material'
import { observer } from 'mobx-react-lite'

const StyledCardContent = styled(CardContent)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '0px !important',
})

const StyledIconButton = styled(IconButton)({ width: 50, height: 50 })

type RatingComponentProps = {
    onClick: (id: NotesOption) => void
}

const RatingComponent = ({ onClick }: RatingComponentProps) => {
    return (
        <StyledCardContent>
            {Object.entries(NOTES_VALUES).map(([key, value]) => (
                <StyledIconButton key={key} onClick={() => onClick(key as NotesOption)}>
                    {value}
                </StyledIconButton>
            ))}
        </StyledCardContent>
    )
}

export default observer(RatingComponent)
