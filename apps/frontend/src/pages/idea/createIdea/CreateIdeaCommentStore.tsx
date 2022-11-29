import { LoadingStateStore } from '../../../reusableComponents/form/LoadingStateStore'
import { makeAutoObservable } from 'mobx'
import { TextFieldStore } from '../../../reusableComponents/form/TextFieldStore'
import { fetchBackendJson, getErrorMessage } from '../../../api/fetch'
import { IIdeaComment } from '@galadrim-tools/shared'
import { notifyError } from '../../../utils/notification'

export const APPLICATION_JSON_HEADERS = [['Content-Type', 'application/json']] as [string, string][]
export class CreateIdeaCommentStore {
    ideaId: IIdeaComment['ideaId']
    userId: IIdeaComment['userId']
    message = new TextFieldStore()

    loadingState = new LoadingStateStore()

    constructor(ideaId: IIdeaComment['ideaId'], userId: IIdeaComment['userId']) {
        this.ideaId = ideaId
        this.userId = userId
        makeAutoObservable(this)
    }

    get canCreateIdeaComment() {
        return this.message.text.length > 1
    }

    async createIdeaComment() {
        const result = await fetchBackendJson<{ message: string; comment: IIdeaComment }, unknown>(
            '/createIdeaComment',
            'POST',
            {
                body: JSON.stringify({
                    ideaId: this.ideaId,
                    userId: this.userId,
                    message: this.message.text,
                }),
                headers: APPLICATION_JSON_HEADERS,
            }
        )

        if (!result.ok) {
            notifyError(getErrorMessage(result.json))
        }
    }
}
