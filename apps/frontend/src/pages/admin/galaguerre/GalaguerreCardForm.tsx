import { GALAGUERRE_CARD_MODES, GALAGUERRE_CARD_TYPES } from '@galadrim-tools/shared'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { observer } from 'mobx-react-lite'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { GaladrimLogo } from '../../../reusableComponents/Branding/GaladrimLogo'
import { CustomLink } from '../../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../../reusableComponents/Core/GaladrimRoomsCard'
import { CenteredDiv } from '../../../reusableComponents/common/CenteredDiv'
import { GaladrimButton } from '../../../reusableComponents/common/GaladrimButton'
import {
    BasicSelectRhf,
    getBasicSelectOptions,
} from '../../../reusableComponents/rhf/BasicSelectRhf'
import { DoubleFields } from '../../../reusableComponents/rhf/MultipleFields'
import { SimpleForm } from '../../../reusableComponents/rhf/SimpleForm'
import { TextFieldRhf, getNumberFieldProps } from '../../../reusableComponents/rhf/TextFieldRhf'
import { MinionForm } from './MinionForm'
import { WithCardFormData } from './useCardForm'

const GALAGUERRE_CARD_MODES_OPTIONS = getBasicSelectOptions(GALAGUERRE_CARD_MODES)
const GALAGUERRE_CARD_TYPES_OPTIONS = getBasicSelectOptions(GALAGUERRE_CARD_TYPES)

export const GalaguerreCardForm = observer<WithCardFormData & { mode: 'create' | 'edit' }>(
    ({ formData, mode }) => {
        const { control } = formData
        const isMobile = useIsMobile()

        return (
            <CenteredDiv>
                <GaladrimRoomsCard size="large" sx={{ width: '100%' }}>
                    <GaladrimLogo align="center" sx={{ mb: 1 }} />

                    <h2>{mode === 'create' ? 'Créer une carte' : 'Modifier une carte'}</h2>

                    <SimpleForm
                        onSubmit={() => {
                            console.log('TODO submit')
                        }}
                        style={{ width: isMobile ? '100%' : '80vw' }}
                    >
                        <DoubleFields my={2}>
                            <TextFieldRhf control={control} name="label" label="Nom de la carte" />
                            <TextFieldRhf
                                {...getNumberFieldProps({ min: 0 })}
                                control={control}
                                name="cost"
                                label="Coût de la carte"
                            />
                        </DoubleFields>
                        <DoubleFields my={2}>
                            <BasicSelectRhf
                                control={control}
                                name="cardMode"
                                options={GALAGUERRE_CARD_MODES_OPTIONS}
                                label="Mode"
                            />
                            <BasicSelectRhf
                                control={control}
                                name="type"
                                options={GALAGUERRE_CARD_TYPES_OPTIONS}
                                label="Type"
                            />
                        </DoubleFields>
                        <MinionForm formData={formData} />

                        <GaladrimButton sx={{ mt: 2 }} isSubmit>
                            Sauvegarder
                        </GaladrimButton>
                    </SimpleForm>

                    <CustomLink to="/admin/galaguerre" style={{ marginTop: 100 }}>
                        <BackIcon /> Retour à la page d'administration
                    </CustomLink>
                </GaladrimRoomsCard>
            </CenteredDiv>
        )
    }
)
