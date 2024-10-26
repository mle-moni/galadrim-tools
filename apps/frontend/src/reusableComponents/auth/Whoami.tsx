import { Avatar, Box, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { AppStore } from "../../globalStores/AppStore";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Notifications } from "../../pages/notifications/Notifications";
import { WhoamiStore } from "./WhoamiStore";

export const Whoami = observer(() => {
    const { authStore } = AppStore;
    const store = new WhoamiStore();
    const isMobile = useIsMobile();

    return (
        <Stack display="flex" direction="column" alignItems="center">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                }}
                onClick={() => {
                    AppStore.navigate("/profile");
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {!isMobile && (
                        <Notifications sx={{ position: "absolute", zIndex: 10, left: -8 }} />
                    )}
                    <Avatar
                        alt={authStore.user.username}
                        src={authStore.user.imageUrl}
                        sx={{ width: 56, height: 56, mb: 1 }}
                    />
                </Box>
                <Typography
                    variant="caption"
                    fontSize={16}
                    onClick={() => store.onClick()}
                    gutterBottom
                >
                    {authStore.user.username}
                </Typography>
            </Box>

            {!isMobile && <div style={{ width: 120 }} />}
        </Stack>
    );
});
