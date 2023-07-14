import { FormControl, InputLabel, MenuItem, Select, SxProps } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { ReactNode } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

export interface BasicSelectOption<T extends string | number> {
    value: T
    label: string
    icon?: JSX.Element
}

export interface BasicSelectProps<T extends string | number> {
    value: T
    options: readonly BasicSelectOption<T>[]
    onChange?: (value: T) => void
    sx?: SxProps
    label?: string
    required?: boolean
    disabled?: boolean
    onBlur?: () => void
    errorMessage?: string
    size?: 'small' | 'medium'
    startAdornment?: ReactNode
    renderValue?: (value: T) => ReactNode
}

export const BasicSelect = observer(
    <T extends string | number>({
        options,
        onChange,
        value,
        sx,
        label,
        required,
        onBlur,
        errorMessage,
        size,
        startAdornment,
        renderValue,
        disabled,
    }: BasicSelectProps<T>) => {
        const id = `select-label-${label}`
        const isString = typeof value === 'string'

        return (
            <FormControl fullWidth sx={sx}>
                {label !== undefined && <InputLabel id={id}>{label}</InputLabel>}
                <Select
                    labelId={id}
                    value={value}
                    onChange={(e) => {
                        onChange?.((isString ? e.target.value : +e.target.value) as T)
                    }}
                    label={label}
                    required={required}
                    onBlur={onBlur}
                    error={errorMessage !== undefined}
                    size={size}
                    startAdornment={startAdornment}
                    renderValue={renderValue}
                    disabled={disabled}
                >
                    {options.map((o) => (
                        <MenuItem key={o.value} value={o.value} dense>
                            {o.icon}
                            {o.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        )
    }
)

type BasicSelectRhfProps<T extends FieldValues, SelectType extends string | number> = {
    control: Control<T>
    name: Path<T>
    beforeChange?: (newValue: SelectType) => void
    afterChange?: (newValue: SelectType) => void
} & Omit<BasicSelectProps<SelectType>, 'value'>

export const BasicSelectRhf = observer(
    <T extends FieldValues, SelectType extends string | number>(
        props: BasicSelectRhfProps<T, SelectType>
    ) => {
        const { name, control, beforeChange, afterChange, ...inputProps } = props

        const {
            field: { value, onChange },
            fieldState: { error },
        } = useController({ name, control })

        const handleChange = (newValue: SelectType) => {
            beforeChange?.(newValue)
            onChange(newValue as any)
            afterChange?.(newValue)
        }

        return (
            <BasicSelect
                {...inputProps}
                value={value}
                onChange={handleChange}
                errorMessage={error?.message}
            />
        )
    }
)

// if labels = values
export const getBasicSelectOptions = <T extends readonly string[]>(options: T) =>
    options.map((v) => ({ label: v, value: v }))

// if labels = values
export const getBasicSelectOptionsFromNumbers = <T extends readonly number[]>(options: T) =>
    options.map((v) => ({ label: v.toString(), value: v }))
