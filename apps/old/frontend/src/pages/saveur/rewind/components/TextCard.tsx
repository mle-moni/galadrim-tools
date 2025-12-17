import { Box } from "@mui/material";

type TextCardProps = {
    children: React.ReactNode;
};

export const TextCard = ({ children }: TextCardProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "fit-content",
                height: "fit-content",
                padding: "16px",
            }}
        >
            {children}
        </Box>
    );
};
