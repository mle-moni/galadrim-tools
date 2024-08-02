import BackIcon from "@mui/icons-material/ChevronLeft";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { AppStore } from "../../../globalStores/AppStore";
import { CustomLink } from "../../../reusableComponents/Core/CustomLink";
import MainLayout from "../../../reusableComponents/layouts/MainLayout";
import { NotificationSettingsStore } from "./NotificationsSettingsStore";

export const NotificationsSettingsPage = observer(() => {
    const { authStore } = AppStore;
    const notificationsSettingsStore = useMemo(
        () => new NotificationSettingsStore(authStore),
        [authStore],
    );

    return (
        <MainLayout fullscreen>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 800,
                    }}
                >
                    <Typography sx={{ fontSize: 20, mb: 2 }}>
                        Recevoir une notification lorsque :
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notificationsSettingsStore.hasNotificationEnabled(
                                    "NEW_RESTAURANT",
                                )}
                                onChange={() => {
                                    notificationsSettingsStore.toggleNotification("NEW_RESTAURANT");
                                }}
                            />
                        }
                        label="Un nouveau restaurant est ajouté"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notificationsSettingsStore.hasNotificationEnabled(
                                    "NEW_IDEA",
                                )}
                                onChange={() => {
                                    notificationsSettingsStore.toggleNotification("NEW_IDEA");
                                }}
                            />
                        }
                        label="Une nouvelle idée est publiée"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notificationsSettingsStore.hasNotificationEnabled(
                                    "NEW_REVIEW",
                                )}
                                onChange={() => {
                                    notificationsSettingsStore.toggleNotification("NEW_REVIEW");
                                }}
                            />
                        }
                        label="Un nouvel avis de restaurant est publié"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={notificationsSettingsStore.hasNotificationEnabled(
                                    "NEW_IDEA_COMMENT",
                                )}
                                onChange={() => {
                                    notificationsSettingsStore.toggleNotification(
                                        "NEW_IDEA_COMMENT",
                                    );
                                }}
                            />
                        }
                        label="Un nouveau commentaire est publié sur l'une de vos idées"
                    />
                    <br />
                    <CustomLink to="/profile">
                        <BackIcon /> Page précédente
                    </CustomLink>
                </Box>
            </Box>
        </MainLayout>
    );
});

export default NotificationsSettingsPage;
