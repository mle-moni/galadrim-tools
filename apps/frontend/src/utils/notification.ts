import { AppStore } from '../stores/AppStore'

export const notifySuccess = (text: string, autoHideDuration = 3000) => {
    AppStore.notification.push(text, {
        variant: 'success',
        autoHideDuration,
    })
}

export const notifyError = (text: string, autoHideDuration = 3000) => {
    AppStore.notification.push(text, {
        variant: 'error',
        autoHideDuration,
    })
}
