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
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
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
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('DASHBOARD_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('DASHBOARD_ADMIN')
                            }}
                        />
                    }
                    label="Administration du dashboard"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('IDEAS_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('IDEAS_ADMIN')
                            }}
                        />
                    }
                    label="Administration des idées"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('NOTIFICATION_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('NOTIFICATION_ADMIN')
                            }}
                        />
                    }
                    label="Administration des notifications"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('CODE_NAMES_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('CODE_NAMES_ADMIN')
                            }}
                        />
                    }
                    label="Administration du code names"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={editUserRightsStore.hasRight('GALAGUERRE_ADMIN')}
                            onChange={() => {
                                editUserRightsStore.toggleRight('GALAGUERRE_ADMIN')
                            }}
                        />
                    }
                    label="Administration de Galaguerre"
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
        <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600 }}>
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
        </GaladrimRoomsCard>
    )
})
