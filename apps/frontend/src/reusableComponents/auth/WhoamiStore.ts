import { ApiError } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson } from '../../api/fetch'
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
            clipboardCopy(res.json.token, {
                success: () => {
                    notifySuccess('API token copié dans le presse papier')
                },
                error: () => {
                    console.log('%c*********** API TOKEN ***********', 'color: #4287f5')
                    console.log(`%c${res.json.token}`, 'color: #a442f5')
                    console.log('%c*********************************', 'color: #4287f5')
                    notifyError(
                        'impossible de copier dans le presse papier, ouvrez la console pour récuperer le token'
                    )
                },
            })
        }
    }
}

export async function clipboardCopy(
    text: string,
    { success, error }: { success: () => void; error: () => void }
) {
    const permissions = await navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: 'clipboard-write',
    })
    if (permissions.state === 'granted' || permissions.state === 'prompt') {
        await navigator.clipboard.writeText(text)
        success()
        return
    }
    error()
}
