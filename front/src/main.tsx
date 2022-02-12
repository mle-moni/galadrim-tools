import { SnackbarProvider, useSnackbar } from 'notistack'
import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import { useNavigate } from 'react-router-dom'
import MainRouter from './routes/MainRouter'
import { AppStore } from './stores/AppStore'

const SnackBarSetter: FC = ({ children }) => {
    const snackbarMethods = useSnackbar()
    AppStore.notification.setMethods(snackbarMethods)
    return <>{children}</>
}

ReactDOM.render(
    <React.StrictMode>
        <SnackbarProvider>
            <SnackBarSetter>
                <MainRouter />
            </SnackBarSetter>
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
