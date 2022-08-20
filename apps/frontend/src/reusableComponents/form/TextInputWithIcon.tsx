import { InputAdornment, OutlinedInput, SvgIconTypeMap } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { observer } from 'mobx-react-lite'

export interface TextInputWithIconProps {
    value: string
    placeholder: string
    Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>> & {
        muiName: string
    }
    onChange: (value: string) => void
}

export const TextInputWithIcon = observer<TextInputWithIconProps>(
    ({ value, onChange, placeholder, Icon }) => {
        return (
            <OutlinedInput
                value={value}
                onChange={(e) => onChange(e.target.value)}
                fullWidth
                placeholder={placeholder}
                startAdornment={
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                        <Icon />
                    </InputAdornment>
                }
                sx={{ mt: 2 }}
            />
        )
    }
)
