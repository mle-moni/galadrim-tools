import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../../api/fetch'
import { notifyError, notifySuccess } from '../../../utils/notification'

export class CreateUserStore {
    public email = ''

    public username = ''

    constructor() {
        makeAutoObservable(this)
    }

    setEmail(email: string) {
        this.email = email
    }

    setUsername(username: string) {
        this.username = username
    }

    get canCreateUser() {
        return this.email !== '' && this.username !== ''
    }

    async createUser() {
        const data = new FormData()
        data.append('email', this.email)
        data.append('username', this.username)
        const res = await fetchBackendJson('/admin/createUser', 'POST', {
            body: data,
        })
        if (res.ok) {
            notifySuccess(`L'utilisateur ${this.username} a été créé !`)
            this.setEmail('')
            this.setUsername('')
        } else {
            notifyError(
                getErrorMessage(res.json, `Impossible de créer l'utilisateur ${this.username}`)
            )
        }
    }
}
