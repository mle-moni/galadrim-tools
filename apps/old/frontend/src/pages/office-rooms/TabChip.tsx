import { Chip, Tab } from "@mui/material";

export const TabChip = ({ label, onClick }: { label: string; onClick?: () => void }) => {
    return (
        <Tab
            icon={<Chip label={label} onClick={onClick} sx={{ mx: 0.5 }} />}
            sx={{
                minWidth: "auto", // Minimizes width of each tab
                padding: 0,
                cursor: "pointer",
                textTransform: "none",
            }}
            disableRipple
        />
    );
};
