import { ThemeProvider } from '@mui/material'
import { SnackbarProvider, useSnackbar } from 'notistack'
import React, { FC, PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import MainRouter from './routes/MainRouter'
import { AppStore } from './stores/AppStore'
import { getTheme } from './theme'
import './theme/react-big-calendar.css'

const theme = getTheme()

const SnackBarSetter: FC<PropsWithChildren<{}>> = ({ children }) => {
    const snackbarMethods = useSnackbar()
    AppStore.notification.setMethods(snackbarMethods)
    return <>{children}</>
}

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <SnackBarSetter>
                    <MainRouter />
                </SnackBarSetter>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
