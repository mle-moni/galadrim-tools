import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider, useSnackbar } from "notistack";
import React, { type FC, type PropsWithChildren } from "react";
import { createRoot } from "react-dom/client";
import { AppStore } from "./globalStores/AppStore";
import { queryClient } from "./queryClient";
import MainRouter from "./routes/MainRouter";
import { getTheme } from "./theme";
import "./theme/react-big-calendar.css";

const theme = getTheme();

const SnackBarSetter: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const snackbarMethods = useSnackbar();
    AppStore.notification.setMethods(snackbarMethods);
    return <>{children}</>;
};

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <NuqsAdapter>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <SnackBarSetter>
                        <QueryClientProvider client={queryClient}>
                            <MainRouter />
                        </QueryClientProvider>
                    </SnackBarSetter>
                </SnackbarProvider>
            </ThemeProvider>
        </NuqsAdapter>
    </React.StrictMode>,
);
