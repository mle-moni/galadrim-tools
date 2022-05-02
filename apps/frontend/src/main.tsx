import { ThemeProvider } from '@mui/material'
import { SnackbarProvider, useSnackbar } from 'notistack'
import React, { FC, PropsWithChildren } from 'react'
import { createRoot } from 'react-dom/client'
import MainRouter from './routes/MainRouter'
import { AppStore } from './stores/AppStore'
import { getTheme } from './theme'
import './theme/react-big-calendar.css'

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
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <SnackBarSetter>
                    <MainRouter />
                </SnackBarSetter>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
)
