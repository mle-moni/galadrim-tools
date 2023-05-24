import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../../api/fetch'
import { AppStore } from '../../globalStores/AppStore'
import { ImageInputStore } from '../../reusableComponents/form/ImageInputStore'
import { notifyError, notifySuccess } from '../../utils/notification'

export class CodeNamesFormStore {
    redSpyMaster: number | null = null
    blueSpyMaster: number | null = null

    imageStore = new ImageInputStore()

    constructor() {
        makeAutoObservable(this)
    }

    get blueSpyMasterOption() {
        if (!this.blueSpyMaster) return null
        const user = AppStore.users.get(this.blueSpyMaster) ?? null
        if (!user) return null
        return { label: user.username, value: user.id }
    }

    get redSpyMasterOption() {
        if (!this.redSpyMaster) return null
        const user = AppStore.users.get(this.redSpyMaster)
        if (!user) return null
        return { label: user.username, value: user.id }
    }

    setRedSpyMaster(newValue: number | null) {
        this.redSpyMaster = newValue
    }

    setBlueSpyMaster(newValue: number | null) {
        this.blueSpyMaster = newValue
    }

    getPayload() {
        const data = new FormData()

        if (!this.redSpyMaster || !this.blueSpyMaster) return

        data.append('redSpyMasterId', this.redSpyMaster.toString())
        data.append('blueSpyMasterId', this.blueSpyMaster.toString())

        if (this.imageStore.image) {
            data.append('image', this.imageStore.image)
        }

        return data
    }

    async submit() {
        const data = this.getPayload()

        const res = await fetchBackendJson('/codeNamesGames', 'POST', {
            body: data,
        })

        if (res.ok) {
            notifySuccess(`Une nouvelle partie a été créée !`)
        } else {
            notifyError(getErrorMessage(res.json, `Impossible de créer la partie, bizarre`))
        }
    }
}
