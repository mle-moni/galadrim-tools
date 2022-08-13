import { VariantType } from 'notistack'
import { AppStore } from '../globalStores/AppStore'

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

export const notifyUser = (
    text: string,
    variant: VariantType = 'default',
    autoHideDuration = 3000
) => {
    AppStore.notification.push(text, {
        variant,
        autoHideDuration,
    })
}
