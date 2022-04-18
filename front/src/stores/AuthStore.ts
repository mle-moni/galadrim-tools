import { makeAutoObservable } from 'mobx'
import { ApiError, fetchBackendJson } from '../api/fetch'
import { notifyError, notifySuccess } from '../utils/notification'
import { AppStore } from './AppStore'

export interface ApiUser {
    id: number
    username: string
    socketToken: string
    imageUrl: string
}

export class AuthStore {
    public connected = false

    private _user: ApiUser | null = null

    public email = localStorage.getItem('email') || ''

    public password = ''

    constructor() {
        makeAutoObservable(this)
    }

    async init() {
        const res = await fetchBackendJson<ApiUser, ApiError>('/me')
        if (res.ok) {
            this.setUser(res.json)
            AppStore.socketStore.connect()
        }
    }

    async login() {
        const data = new FormData()
        if (this.email === '' || this.password === '') return
        data.append('email', this.email)
        data.append('password', this.password)
        const res = await fetchBackendJson<ApiUser, ApiError>('/login', 'POST', { body: data })
        if (!res.ok) {
            notifyError('Adresse mail ou mot de passe incorrect')
            return
        }
        this.setUser(res.json)
        this.setPassword('')
        AppStore.socketStore.connect()
        AppStore.navigate('/')
        notifySuccess(`Bienvenue ${res.json.username} !`)
    }

    async logout() {
        await fetchBackendJson('/logout', 'POST')
        this.setUser(null)
        AppStore.socketStore.disconnect()
        AppStore.navigate('/login')
        notifySuccess('Vous êtes bien déconnecté')
    }

    setUser(user: ApiUser | null) {
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
}
