import { TextField } from '@mui/material'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

type DateInputRhfProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    label: string
    required?: boolean
    afterChange?: (value: Date | null) => void
}

function DatePickerRhf<T extends FieldValues>(props: DateInputRhfProps<T>) {
    const { name, control, label, required, afterChange } = props

    const {
        field: { value, onChange, onBlur: rhfOnBlur },
        fieldState: { error },
    } = useController({ name, control })

    return (
        <DesktopDatePicker
            label={label}
            inputFormat="dd/MM/yyyy"
            value={value}
            onChange={(newValue) => {
                onChange(newValue)
                afterChange?.(newValue)
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    onBlur={rhfOnBlur}
                    style={{ flex: 1 }}
                    required={required}
                    error={error?.message !== undefined}
                    helperText={error?.message}
                />
            )}
        />
    )
}

export default DatePickerRhf
