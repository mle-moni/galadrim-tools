import { Link as MuiLink } from "@mui/material";
import type { CSSProperties, PropsWithChildren } from "react";
import { Link } from "react-router-dom";

type CustomLinkProps = PropsWithChildren<{
    to: string;
    p?: string | number;
    style?: CSSProperties;
}>;

export const CustomLink = ({ children, p, ...rest }: CustomLinkProps) => {
    return (
        <MuiLink
            component={Link}
            sx={{
                p: p,
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                fontStyle: "italic",
                transition: "all 0.3s",
                ":hover": {
                    opacity: 0.7,
                },
            }}
            {...rest}
        >
            {children}
        </MuiLink>
    );
};
