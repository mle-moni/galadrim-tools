import { AppStore } from '../stores/AppStore'

export const notifySuccess = (text: string) => {
    AppStore.notification.push(text, {
        variant: 'success',
        autoHideDuration: 3000,
    })
}

export const notifyError = (text: string) => {
    AppStore.notification.push(text, {
        variant: 'error',
        autoHideDuration: 3000,
    })
}
