import { ITag } from '@galadrim-rooms/shared'
import { makeAutoObservable } from 'mobx'
import { fetchBackendJson, getErrorMessage } from '../api/fetch'
import { notifyError, notifySuccess } from '../utils/notification'

export class TagsStore {
    tags: ITag[] = []

    newTagName = ''
    creationModalVisible = false

    constructor() {
        makeAutoObservable(this)
    }

    setTags(tags: ITag[]) {
        this.tags = tags
    }

    async fetch() {
        const req = await fetchBackendJson<ITag[], unknown>('/tags')
        if (req.ok) {
            this.setTags(req.json)
            return
        }
        notifyError('Impossible de récupérer les tags')
    }

    setNewTagName(tagName: string) {
        this.newTagName = tagName
    }

    setCreationModalVisible(state: boolean) {
        this.creationModalVisible = state
    }

    private reset() {
        this.setNewTagName('')
        this.setCreationModalVisible(false)
    }

    pushTag(tag: ITag) {
        this.tags.push(tag)
    }

    async createTag() {
        const tagName = this.newTagName

        const data = new FormData()
        data.append('name', tagName)

        const res = await fetchBackendJson<ITag, unknown>('/tags', 'POST', {
            body: data,
        })

        if (res.ok) {
            notifySuccess(`Le tag ${tagName} a été créé !`)
            this.reset()
            this.pushTag(res.json)
        } else {
            notifyError(getErrorMessage(res.json, `Impossible de créer le tag ${tagName}`))
        }
    }

    get canSave() {
        return this.newTagName.length >= 2
    }
}
