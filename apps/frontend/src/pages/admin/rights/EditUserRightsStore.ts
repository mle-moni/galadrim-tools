import { AllRights, ApiNotification, hasRights, RIGHTS, _assert } from '@galadrim-tools/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../../api/fetch'
import { notifyError, notifySuccess } from '../../../utils/notification'

interface UserRights {
    id: number
    username: string
    rights: number
}

export class EditUserRightsStore {
    public userId?: number = undefined

    private arrayUserRights: UserRights[] = []

    public userRights = new Map<number, UserRights>()

    public loading = false

    constructor() {
        makeAutoObservable(this)
    }

    setUsers(users: UserRights[]) {
        this.arrayUserRights = users
        this.userRights = new Map(users.map((user) => [user.id, user]))
    }

    setLoading(state: boolean) {
        this.loading = state
    }

    async init() {
        if (this.loading) {
            return
        }
        this.setLoading(true)
        const res = await fetchBackendJson<UserRights[], unknown>('/admin/userRights')
        this.setLoading(false)
        if (!res.ok) {
            notifyError(
                getErrorMessage(
                    res.json,
                    `Impossible récuperrer les droits des utilisateurs, bizarre`
                )
            )
            return
        }
        this.setUsers(res.json)
    }

    setUserId(userId?: number) {
        this.userId = userId
    }

    get rights() {
        _assert(this.userId, 'you need to set userId before using this computed')
        const user = this.userRights.get(this.userId)
        _assert(user, `could not find user with id ${this.userId}`)
        return user.rights
    }

    addRight(right: number) {
        _assert(this.userId, 'you need to set userId before using this method')
        const user = this.userRights.get(this.userId)
        _assert(user, `could not find user with id ${this.userId}`)
        user.rights += right
    }

    toggleRight(right: AllRights) {
        if (this.hasRight(right)) {
            this.addRight(-RIGHTS[right])
        } else {
            this.addRight(RIGHTS[right])
        }
    }

    async editUserRights() {
        const form = new FormData()
        _assert(this.userId, 'this.userId should not be undefined when calling editUserRights')
        form.append('id', this.userId.toString())
        form.append('rights', this.rights.toString())
        const res = await fetchBackendJson<ApiNotification, unknown>('/admin/userRights', 'PUT', {
            body: form,
        })
        if (!res.ok) {
            notifyError(
                getErrorMessage(
                    res.json,
                    `Impossible d'éditer les droits de cet utilisateur, bizarre`
                )
            )
            return
        }
        notifySuccess(res.json.notification)
    }

    get canStartEditRights() {
        return this.userId !== undefined && this.fetchingDone
    }

    hasRight(right: AllRights) {
        return hasRights(this.rights, [right])
    }

    get fetchingDone() {
        return this.userRights.size !== 0
    }

    get userOptions(): { label: string; id: number }[] {
        return this.arrayUserRights.map(({ id, username }) => ({ label: username, id }))
    }
}
