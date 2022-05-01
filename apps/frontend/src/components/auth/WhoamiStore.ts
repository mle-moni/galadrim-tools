import { makeAutoObservable } from 'mobx'
import { ApiError, fetchBackendJson } from '../../api/fetch'
import { notifyError, notifySuccess } from '../../utils/notification'

export type ApiToken = {
    type: 'bearer'
    token: string
}

export class WhoamiStore {
    public clickCount = 0

    constructor() {
        makeAutoObservable(this)
    }

    incrementClickCount() {
        ++this.clickCount
    }

    onClick() {
        this.incrementClickCount()
        if (this.clickCount === 5) {
            this.createApiToken()
        }
    }

    async createApiToken() {
        const res = await fetchBackendJson<ApiToken, ApiError>('/createApiToken', 'POST')
        if (res.ok) {
            clipboardCopy(res.json.token)
        }
    }
}

async function clipboardCopy(text: string) {
    // @ts-ignore
    const permissions = await navigator.permissions.query({ name: 'clipboard-write' })
    if (permissions.state === 'granted' || permissions.state === 'prompt') {
        await navigator.clipboard.writeText(text)
        notifySuccess('API token copié dans le presse papier')
        return
    }
    console.log('%c*********** API TOKEN ***********', 'color: #4287f5')
    console.log(`%c${text}`, 'color: #a442f5')
    console.log('%c*********************************', 'color: #4287f5')
    notifyError(
        'impossible de copier dans le presse papier, ouvrez la console pour récuperer le token'
    )
}
