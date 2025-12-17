import { Card as MuiCard, type CardProps as MuiCardProps, styled } from "@mui/material";

interface CardProps extends MuiCardProps {
    size?: "large" | "normal";
}

const Root = styled(MuiCard)<CardProps>(({ size, theme }) => ({
    p: size === "normal" ? 4 : 8,
    borderRadius: 1.5,
    boxShadow: "0 5px 10px 0 rgba(31, 51, 86, 0.06)",
    [theme.breakpoints.down("sm")]: {
        borderRadius: 0,
    },
}));

export const GaladrimRoomsCard = ({ size = "normal", ...rest }: CardProps) => {
    return <Root size={size} {...rest} />;
};
