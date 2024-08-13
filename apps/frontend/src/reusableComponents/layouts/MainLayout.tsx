import { Box, experimental_sx as sx, styled } from "@mui/material";
import { observer } from "mobx-react-lite";
import type { ComponentProps, FC, PropsWithChildren } from "react";
import { AppStore } from "../../globalStores/AppStore";
import { useCheckConnection } from "../../hooks/useCheckConnection";
import { PatchNotes } from "../../reusableComponents/patchNotes/PatchNotes";
import { getTheme } from "../../theme";
import { Whoami } from "../auth/Whoami";

type MainLayoutProps = PropsWithChildren<{
    fullscreen?: boolean;
    noDisconnect?: boolean;
}>;

const Root = styled(Box, {
    shouldForwardProp: (propName: string) => propName !== "fullscreen",
})<MainLayoutProps>(({ fullscreen }) =>
    sx({
        display: "flex",
        minHeight: fullscreen ? "100vh" : "auto",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        backgroundColor: fullscreen ? "inherit" : getTheme().palette.background.default,
    }),
);

export const MainLayout = observer(
    ({ fullscreen, children, noDisconnect }: ComponentProps<FC<MainLayoutProps>>) => {
        const { authStore } = AppStore;

        useCheckConnection(authStore);

        return (
            <Root fullscreen={fullscreen}>
                <div
                    style={{
                        width: "100%",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: 32,
                            right: 32,
                            zIndex: 10,
                        }}
                    >
                        {authStore.connected && <Whoami noDisconnect={noDisconnect} />}
                    </Box>
                    {children}
                </div>
                <PatchNotes />
            </Root>
        );
    },
);

export default MainLayout;
