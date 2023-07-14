import { ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider, useSnackbar } from 'notistack'
import React, { FC, PropsWithChildren } from 'react'
import { createRoot } from 'react-dom/client'
import { AppStore } from './globalStores/AppStore'
import MainRouter from './routes/MainRouter'
import { getTheme } from './theme'
import './theme/react-big-calendar.css'

const queryClient = new QueryClient()

const theme = getTheme()

const SnackBarSetter: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const snackbarMethods = useSnackbar()
    AppStore.notification.setMethods(snackbarMethods)
    return <>{children}</>
}

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <SnackBarSetter>
                        <MainRouter />
                    </SnackBarSetter>
                </SnackbarProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>
)
