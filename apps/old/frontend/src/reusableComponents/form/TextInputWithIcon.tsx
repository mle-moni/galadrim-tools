import { InputAdornment, OutlinedInput, type SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { observer } from "mobx-react-lite";

export interface TextInputWithIconProps {
    value: string;
    placeholder: string;
    Icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
        muiName: string;
    };
    onChange: (value: string) => void;
    error?: boolean;
    required?: boolean;
    multiline?: boolean;
}

export const TextInputWithIcon = observer<TextInputWithIconProps>(
    ({ value, onChange, placeholder, Icon, error, required, multiline }) => {
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
                error={error}
                required={required}
                multiline={multiline}
            />
        );
    },
);
