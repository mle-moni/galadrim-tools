import { makeAutoObservable } from 'mobx'
import { ApiError, fetchBackendJson } from '../api/fetch'
import { notifySuccess } from '../utils/notification'

export interface ApiUser {
    id: number
    username: string
}

export class AuthStore {
    public connected = false

    private _user: ApiUser | null = null

    public username = localStorage.getItem('username') || ''

    public password = ''

    public errors = ''

    constructor() {
        makeAutoObservable(this)
    }

    async init() {
        const res = await fetchBackendJson<ApiUser, ApiError>('/me')
        if (res.ok) {
            this.setUser(res.json)
        }
    }

    async login() {
        this.setErrors('')
        const data = new FormData()
        if (this.username === '' || this.password === '') return
        data.append('username', this.username)
        data.append('password', this.password)
        const res = await fetchBackendJson<ApiUser, ApiError>('/login', 'POST', { body: data })
        if (!res.ok) {
            this.setErrors(res.json.error)
            return
        }
        this.setUser(res.json)
        this.setPassword('')
        notifySuccess(`Bienvenue ${res.json.username} !`)
    }

    async logout() {
        await fetchBackendJson('/logout', 'POST')
        this.setUser(null)
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
        this.setErrors('')
    }

    setUsername(username: string) {
        this.username = username
        localStorage.setItem('username', username)
    }

    setPassword(password: string) {
        this.password = password
    }

    setErrors(errors: string) {
        this.errors = errors
    }

    get user() {
        if (!this._user) throw new Error('use this computed only after login')
        return this._user
    }
}
