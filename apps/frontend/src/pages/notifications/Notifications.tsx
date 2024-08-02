import { NotificationsNone } from "@mui/icons-material";
import { Box, IconButton, type SxProps, Tooltip, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { SimpleModal } from "../../reusableComponents/modal/SimpleModal";
import { getHumanFormattedDate, getHumanFormattedTimeDifference } from "../idea/ideasUtils";
import { NotificationsComponentStore } from "./NotificationsComponentStore";

export const Notifications = observer<{ sx?: SxProps }>(({ sx }) => {
    const store = useMemo(() => new NotificationsComponentStore(AppStore), []);

    if (!AppStore.authStore.connected) return null;

    return (
        <>
            <SimpleModal open={store.modalStore.modalOpen} onClose={() => store.closeModal()}>
                <Typography sx={{ fontSize: 22, my: 1 }}>Vos notifications</Typography>
                <Box sx={{ maxHeight: "70vh", overflow: "auto", paddingRight: 1 }}>
                    {store.notifications.map(({ id, title, text, link, read, createdAt }) => (
                        <Box
                            key={id}
                            sx={{
                                backgroundColor: read ? "#e8e8e8" : "#ababab",
                                my: 2,
                                p: 1,
                                borderRadius: 1,
                                cursor: link !== null ? "pointer" : undefined,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                store.linkClicked(link);
                            }}
                        >
                            <Typography sx={{ fontSize: 18, mb: 1 }}>{title}</Typography>
                            <Typography>{text}</Typography>
                            <Tooltip title={getHumanFormattedDate(createdAt)}>
                                <Typography sx={{ fontSize: 11, color: "gray" }}>
                                    {getHumanFormattedTimeDifference(createdAt)}
                                </Typography>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            </SimpleModal>
            <Box sx={sx}>
                <IconButton
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        store.showNotifications();
                    }}
                >
                    <NotificationsNone
                        className={store.unread.length !== 0 ? "rotate-center" : undefined}
                        fontSize="large"
                        color={store.unread.length !== 0 ? "error" : undefined}
                    />
                    {store.unread.length !== 0 && <Typography>{store.unread.length}</Typography>}
                </IconButton>
            </Box>
        </>
    );
});
