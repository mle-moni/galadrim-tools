import { LoadingStateStore } from '../../../reusableComponents/form/LoadingStateStore'
import { makeAutoObservable } from 'mobx'
import { TextFieldStore } from '../../../reusableComponents/form/TextFieldStore'
import { fetchBackendJson } from 'apps/frontend/src/api/fetch'

export type CreateIdeaCallback = Parameters<CreateIdeaStore['createIdea']>[0]

export class CreateIdeaStore {
    text = new TextFieldStore()

    loadingState = new LoadingStateStore()

    constructor() {
        makeAutoObservable(this)
    }

    get canCreateIdea() {
        return this.text.text.length > 3
    }

    async createIdea(onPublish: (idea: IIdea) => void) {
        const formData = new FormData()
        formData.append('text', this.text.text)

        // todo put json in the backend
    }
}
