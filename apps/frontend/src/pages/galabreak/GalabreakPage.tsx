import { Autocomplete, TextField, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../reusableComponents/common/GaladrimButton'
import MainLayout from '../../reusableComponents/layouts/MainLayout'
import { GalabreakStore } from './GalabreakStore'

export const GalabreakPage = observer(() => {
    const store = useMemo(() => new GalabreakStore(), [])

    useEffect(() => {
        store.fetchAll()
    }, [])

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

                        <GaladrimButton isSubmit fullWidth={false}>
                            Voter
                        </GaladrimButton>
                    </form>
                </GaladrimRoomsCard>
            </CenteredDiv>
        </MainLayout>
    )
})

export default GalabreakPage
