import { LoadingButton } from "@mui/lab";
import type { ButtonTypeMap, SxProps } from "@mui/material";
import { observer } from "mobx-react-lite";
import type { PropsWithChildren, ReactNode } from "react";

export interface GaladrimButtonProps {
    sx?: SxProps;
    onClick?: () => void;
    disabled?: boolean;
    isSubmit?: boolean;
    isLoading?: boolean;
    fullWidth?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    color?: ButtonTypeMap["props"]["color"];
    variant?: "text" | "contained" | "outlined";
}

export const GaladrimButton = observer<PropsWithChildren<GaladrimButtonProps>>(
    ({
        sx,
        children,
        onClick,
        disabled,
        isSubmit,
        isLoading,
        fullWidth = true,
        startIcon,
        endIcon,
        variant = "contained",
        color,
    }) => {
        return (
            <LoadingButton
                startIcon={startIcon}
                endIcon={endIcon}
                variant={variant}
                fullWidth={fullWidth}
                sx={{ textTransform: "none", fontSize: 18, ...sx }}
                onClick={onClick}
                disabled={disabled}
                type={isSubmit ? "submit" : undefined}
                loading={isLoading}
                color={color}
            >
                {children}
            </LoadingButton>
        );
    },
);
