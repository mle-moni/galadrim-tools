import { Search } from '@mui/icons-material'
import { Autocomplete, SxProps, TextField, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

export interface AutocompleteSelectOption<T extends string | number> {
    value: T
    label: string
}

export interface AutocompleteSelectProps<T extends string | number> {
    value: AutocompleteSelectOption<T> | null
    options: AutocompleteSelectOption<T>[]
    onChange?: (value: AutocompleteSelectOption<T> | null) => void
    label?: string
    className?: string
    searchPlaceholder: string
    getOptionLabel?: (value: AutocompleteSelectOption<T> | T) => string
    errorMessage?: string
    required?: boolean
    onBlur?: () => void
    hasSearchIcon?: boolean
    disableClearable?: boolean
    sx?: SxProps
    size?: 'small' | 'medium'
    error?: boolean
    disabled?: boolean
    loading?: boolean
}

export const AutocompleteSelect = observer(
    <T extends string | number>({
        options,
        value,
        onChange,
        className,
        searchPlaceholder,
        getOptionLabel,
        required,
        errorMessage,
        onBlur,
        hasSearchIcon = true,
        label,
        disableClearable,
        sx,
        size = 'medium',
        error,
        disabled,
        loading,
    }: AutocompleteSelectProps<T>) => (
        <Autocomplete
            disabled={disabled}
            className={className}
            options={options}
            loading={loading}
            value={value || null}
            sx={{ flex: 1, ...sx }}
            onChange={(_, newValue) => onChange?.(newValue)}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, valueToCheck) =>
                option.value === (valueToCheck as unknown as T)
            }
            renderInput={(params) => (
                <Tooltip title={params.inputProps.value}>
                    <TextField
                        {...params}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: hasSearchIcon && <Search />,
                        }}
                        placeholder={searchPlaceholder}
                        fullWidth
                        size={size}
                        error={errorMessage !== undefined || error}
                        helperText={errorMessage}
                        required={required}
                        onBlur={onBlur}
                        label={label}
                    />
                </Tooltip>
            )}
            disableClearable={disableClearable}
        />
    )
)

type AutocompleteSelectRhfProps<T extends FieldValues, SelectType extends string | number> = {
    control: Control<T>
    name: Path<T>
    beforeChange?: (newValue: SelectType | null) => void
    afterChange?: (newValue: SelectType | null) => void
} & Omit<AutocompleteSelectProps<SelectType>, 'value' | 'onChange'>

export const AutocompleteSelectRhf = observer(
    <T extends FieldValues, SelectType extends string | number>(
        props: AutocompleteSelectRhfProps<T, SelectType>
    ) => {
        const { name, control, beforeChange, afterChange, ...inputProps } = props

        const {
            field: { value, onChange, onBlur },
            fieldState: { error },
        } = useController({ name, control })

        const handleChange = useCallback(
            (newValue: AutocompleteSelectOption<SelectType> | null) => {
                const valueToChange = newValue?.value ?? null
                beforeChange?.(valueToChange)
                onChange(valueToChange)
                afterChange?.(valueToChange)
            },
            [beforeChange, onChange, afterChange]
        )

        return (
            <AutocompleteSelect
                {...inputProps}
                value={value}
                onChange={handleChange}
                onBlur={onBlur}
                errorMessage={error?.message}
            />
        )
    }
)
