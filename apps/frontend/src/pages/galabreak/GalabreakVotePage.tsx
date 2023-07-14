import { HowToVote } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppStore } from '../../globalStores/AppStore'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../reusableComponents/common/GaladrimButton'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { GalabreakVoteStore } from './GalabreakVoteStore'

export const GalabreakVotePage = observer(() => {
    const galabreakStore = AppStore.galabreakStore
    const store = useMemo(() => new GalabreakVoteStore(galabreakStore), [galabreakStore])

    useEffect(() => {
        galabreakStore.fetchAll()
    }, [galabreakStore])

    return (
        <MainLayout fullscreen>
            <CenteredDiv>
                <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600, mt: 4 }}>
                    <GaladrimLogo align="center" sx={{ mb: 2 }} />
                    <Typography sx={{ fontSize: 26, textAlign: 'center', m: 2 }}>
                        Une pause s'impose !
                    </Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            return store.submitVote()
                        }}
                    >
                        <Autocomplete
                            sx={{ my: 2 }}
                            disablePortal
                            options={store.activitiesOptions}
                            multiple
                            fullWidth
                            value={store.activitiesValue}
                            renderInput={(params) => (
                                <TextField {...params} label="Choisir une/des activités" />
                            )}
                            onChange={(_e, value) => {
                                if (value) {
                                    store.setActivitiesValue(value)
                                }
                            }}
                            isOptionEqualToValue={(a, b) => a.value === b.value}
                            filterSelectedOptions
                        />

                        <Autocomplete
                            sx={{ my: 2 }}
                            disablePortal
                            options={store.timesOptions}
                            multiple
                            fullWidth
                            value={store.timesValue}
                            renderInput={(params) => (
                                <TextField {...params} label="Choisir une/des disponibilités" />
                            )}
                            onChange={(_e, value) => {
                                if (value) {
                                    store.setTimesValue(value)
                                }
                            }}
                            isOptionEqualToValue={(a, b) => a.value === b.value}
                            filterSelectedOptions
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Link to="/galabreak">
                                <GaladrimButton startIcon={<BackIcon />} variant="contained">
                                    Retour
                                </GaladrimButton>
                            </Link>
                            <GaladrimButton
                                endIcon={<HowToVote />}
                                isSubmit
                                fullWidth={false}
                                disabled={store.isSubmitDisabled}
                            >
                                Voter
                            </GaladrimButton>
                        </Box>
                    </form>
                </GaladrimRoomsCard>
            </CenteredDiv>
        </MainLayout>
    )
})

export default GalabreakVotePage
