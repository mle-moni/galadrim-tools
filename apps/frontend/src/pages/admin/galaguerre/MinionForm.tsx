import { observer } from 'mobx-react-lite'
import { useWatch } from 'react-hook-form'
import { CheckboxRhf } from '../../../reusableComponents/rhf/CheckboxRhf'
import { DoubleFields, MultipleFields } from '../../../reusableComponents/rhf/MultipleFields'
import { TextFieldRhf, getNumberFieldProps } from '../../../reusableComponents/rhf/TextFieldRhf'
import { WithCardFormData } from './useCardForm'

export const MinionForm = observer<WithCardFormData>(({ formData }) => {
    const { control } = formData
    const cardType = useWatch({ control, name: 'type' })

    if (cardType !== 'MINION') return null

    return (
        <div>
            <h3>Minion</h3>
            <DoubleFields my={2}>
                <TextFieldRhf
                    {...getNumberFieldProps({ min: 0 })}
                    control={control}
                    name="minion.attack"
                    label="Points d'attaque"
                />
                <TextFieldRhf
                    {...getNumberFieldProps({ min: 0 })}
                    control={control}
                    name="minion.health"
                    label="Points de vie"
                />
            </DoubleFields>
            <MultipleFields my={2} numberOfFieldsPerLine={4}>
                <CheckboxRhf control={control} name="minion.minionPower.hasCharge" label="Charge" />
                <CheckboxRhf
                    control={control}
                    name="minion.minionPower.hasTaunt"
                    label="Provocation"
                />
                <CheckboxRhf
                    control={control}
                    name="minion.minionPower.hasWindfury"
                    label="Furie des vents"
                />
                <CheckboxRhf
                    control={control}
                    name="minion.minionPower.isPoisonous"
                    label="Toxique"
                />
            </MultipleFields>
        </div>
    )
})
