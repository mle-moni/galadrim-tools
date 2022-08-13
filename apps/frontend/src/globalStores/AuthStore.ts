import { ApiError, ApiNotification, IUserData } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../api/fetch'
import { notifyError, notifySuccess } from '../utils/notification'
import { AppStore } from './AppStore'

const CHANGE_PASSWORD_INTENT = 'changePassword' as const

export class AuthStore {
    public connected = false

    private _user: IUserData | null = null

    public email = localStorage.getItem('email') || ''

    public password = ''

    constructor() {
        makeAutoObservable(this)
    }

    async init() {
        const res = await fetchBackendJson<IUserData, ApiError>('/me')
        if (res.ok) {
            this.setUser(res.json)
            AppStore.socketStore.connect()
        }
    }

    get canAuthenticate() {
        return this.email !== '' && this.password !== ''
    }

    get canChangePassword() {
        return this.password !== ''
    }

    async login() {
        const data = new FormData()
        if (!this.canAuthenticate) return
        data.append('email', this.email)
        data.append('password', this.password)
        const res = await fetchBackendJson<IUserData, ApiError>('/login', 'POST', { body: data })
        if (!res.ok) {
            notifyError('Adresse mail ou mot de passe incorrect')
            return
        }
        this.setUser(res.json)
        this.setPassword('')
        AppStore.socketStore.connect()
        const params = new URLSearchParams(location.search)
        notifySuccess(`Bienvenue ${res.json.username} !`)
        if (params.get('intent') === CHANGE_PASSWORD_INTENT) {
            AppStore.navigate('/changePassword')
        } else {
            AppStore.navigate('/')
        }
    }

    async logout() {
        await fetchBackendJson('/logout', 'POST')
        this.setUser(null)
        AppStore.socketStore.disconnect()
        AppStore.navigate('/login')
        notifySuccess('Vous êtes bien déconnecté')
    }

    setUser(user: IUserData | null) {
        if (!user) {
            this._user = null
            this.connected = false
            return
        }
        this._user = user
        this.connected = true
    }

    setEmail(email: string) {
        this.email = email
        localStorage.setItem('email', email)
    }

    setPassword(password: string) {
        this.password = password
    }

    get user() {
        if (!this._user) throw new Error('use this computed only after login')
        return this._user
    }

    async getOtp() {
        const data = new FormData()
        data.append('email', this.email)
        const res = await fetchBackendJson<ApiNotification, unknown>('/getOtp', 'POST', {
            body: data,
        })
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, `Impossible d'envoyer un mail a cette adresse, bizarre`)
            )
        }
        notifySuccess(res.json.notification)
        AppStore.navigate(`/login?intent=${CHANGE_PASSWORD_INTENT}`)
    }

    async changePassword() {
        const data = new FormData()
        data.append('password', this.password)
        const res = await fetchBackendJson<ApiNotification, unknown>('/changePassword', 'POST', {
            body: data,
        })
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, `Impossible de mettre à jour le mot de passe, bizarre`)
            )
        }
        notifySuccess(res.json.notification)
        this.setPassword('')
        AppStore.navigate(`/`)
    }
}
