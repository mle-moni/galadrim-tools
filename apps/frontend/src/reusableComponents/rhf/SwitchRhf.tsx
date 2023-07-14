import { CheckboxProps, FormControlLabel, Switch } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type SwitchWrapperProps = Omit<CheckboxProps, 'onChange'> & {
    onBlur?: () => void
    label?: string
    value: boolean
    onChange?: (v: boolean) => void
}

export const SwitchWrapper = observer<SwitchWrapperProps>((props) => {
    const { onBlur, label, value, onChange, sx, ...switchComponentProps } = props

    const switchComponent = (
        <Switch
            {...switchComponentProps}
            sx={!label ? sx : undefined}
            checked={value}
            onBlur={onBlur}
            onChange={(_, checked) => onChange?.(checked)}
        />
    )

    if (label !== undefined) {
        return <FormControlLabel sx={sx} control={switchComponent} label={label} />
    }

    return switchComponent
})

type SwitchRhfProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
} & Omit<SwitchWrapperProps, 'onChange' | 'value'>

export const SwitchRhf = observer(<T extends FieldValues>(props: SwitchRhfProps<T>) => {
    const { name, control, onBlur, ...switchComponentProps } = props

    const {
        field: { value, onChange, onBlur: rhfOnBlur },
    } = useController({ name, control })

    const handleBlur = () => {
        onBlur?.()
        rhfOnBlur()
    }

    return (
        <SwitchWrapper
            {...switchComponentProps}
            onBlur={handleBlur}
            value={value}
            onChange={onChange}
        />
    )
})
