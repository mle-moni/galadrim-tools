import { OptionsObject, SnackbarKey, useSnackbar } from 'notistack'

type SnackbarMethods = ReturnType<typeof useSnackbar>

export class NotificationStore {
    private _push: SnackbarMethods['enqueueSnackbar'] | null = null
    private _close: SnackbarMethods['closeSnackbar'] | null = null

    private notifications: SnackbarKey[] = []

    setMethods(methods: SnackbarMethods) {
        this._push = methods['enqueueSnackbar']
        this._close = methods['closeSnackbar']
    }

    push(text: string, options?: OptionsObject) {
        if (!this._push) throw new Error('snackbar methods should be set before use')
        const key = this._push(text, options)
        this.notifications.push(key)
        return key
    }

    close(key: SnackbarKey) {
        if (!this._close) throw new Error('snackbar methods should be set before use')
        this._close(key)
        this.notifications = this.notifications.filter((notif) => key !== notif)
    }
}
