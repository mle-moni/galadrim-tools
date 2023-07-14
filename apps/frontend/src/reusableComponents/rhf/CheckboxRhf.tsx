import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type CheckboxWrapperProps = Omit<CheckboxProps, 'onChange'> & {
    onBlur?: () => void
    label?: string
    value: boolean
    onChange?: (v: boolean) => void
}

export const CheckboxWrapper = observer<CheckboxWrapperProps>((props) => {
    const { onBlur, label, value, onChange, ...checkboxProps } = props

    const checkbox = (
        <Checkbox
            {...checkboxProps}
            checked={value}
            onBlur={onBlur}
            onChange={(_, checked) => onChange?.(checked)}
        />
    )

    if (label !== undefined) {
        return <FormControlLabel control={checkbox} label={label} />
    }

    return checkbox
})

type CheckboxRhfProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    beforeChange?: (newValue: boolean) => void
    afterChange?: (newValue: boolean) => void
} & Omit<CheckboxWrapperProps, 'onChange' | 'value'>

export const CheckboxRhf = observer(<T extends FieldValues>(props: CheckboxRhfProps<T>) => {
    const { name, control, onBlur, beforeChange, afterChange, ...checkboxProps } = props

    const {
        field: { value, onChange, onBlur: rhfOnBlur },
    } = useController({ name, control })

    const handleBlur = () => {
        onBlur?.()
        rhfOnBlur()
    }

    const handleChange = (newValue: boolean) => {
        beforeChange?.(newValue)
        onChange(newValue)
        afterChange?.(newValue)
    }

    return (
        <CheckboxWrapper
            {...checkboxProps}
            onBlur={handleBlur}
            value={value}
            onChange={handleChange}
        />
    )
})
