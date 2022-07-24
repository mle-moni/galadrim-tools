import BackIcon from '@mui/icons-material/ChevronLeft'
import {
    Autocomplete,
    Button,
    CircularProgress,
    Collapse,
    FormControlLabel,
    FormGroup,
    Switch,
    TextField,
} from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { GaladrimLogo } from '../Branding/GaladrimLogo'
import { Card } from '../Core/Card'
import { CustomLink } from '../Core/CustomLink'
import { EditUserRightsStore } from './EditUserRightsStore'

const RightSwitches = observer<{ editUserRightsStore: EditUserRightsStore }>(
    ({ editUserRightsStore }) => {
        return (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('EVENT_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('EVENT_ADMIN')
                            }}
                        />
                    }
                    label="Administration des événements"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('USER_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('USER_ADMIN')
                            }}
                        />
                    }
                    label="Administration des utilisateurs"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('RIGHTS_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('RIGHTS_ADMIN')
                            }}
                        />
                    }
                    label="Administration des droits"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('MIAM_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('MIAM_ADMIN')
                            }}
                        />
                    }
                    label="Administration des miam"
                />
            </FormGroup>
        )
    }
)

const UserPicker = observer<{ editUserRightsStore: EditUserRightsStore }>(
    ({ editUserRightsStore }) => {
        return (
            <Autocomplete
                disablePortal
                options={editUserRightsStore.userOptions}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Utilisateurs" />}
                onChange={(_e, value) => {
                    if (value) {
                        editUserRightsStore.setUserId(value.id)
                    } else {
                        editUserRightsStore.setUserId(undefined)
                    }
                }}
            />
        )
    }
)

export const EditUserRights = observer(() => {
    const editUserRightsStore = useMemo(() => new EditUserRightsStore(), [])

    useEffect(() => {
        editUserRightsStore.init()
    }, [])

    return (
        <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
            <GaladrimLogo align="center" sx={{ mb: 8 }} />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    editUserRightsStore.editUserRights()
                }}
            >
                {editUserRightsStore.loading && <CircularProgress />}
                {editUserRightsStore.fetchingDone && (
                    <UserPicker editUserRightsStore={editUserRightsStore} />
                )}
                <Collapse in={editUserRightsStore.canStartEditRights}>
                    {editUserRightsStore.canStartEditRights && (
                        <RightSwitches editUserRightsStore={editUserRightsStore} />
                    )}
                </Collapse>
                <Button
                    fullWidth
                    variant="contained"
                    disabled={!editUserRightsStore.canStartEditRights}
                    type="submit"
                    size="large"
                    sx={{ my: 2 }}
                >
                    Editer les droits
                </Button>
                <CustomLink to="/admin">
                    <BackIcon /> Retour à la page d'administration
                </CustomLink>
            </form>
        </Card>
    )
})
