import type { IIdeaComment } from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../../api/fetch";
import { LoadingStateStore } from "../../../reusableComponents/form/LoadingStateStore";
import { TextFieldStore } from "../../../reusableComponents/form/TextFieldStore";
import { notifyError } from "../../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "./CreateIdeaStore";

export class CreateIdeaCommentStore {
    ideaId: IIdeaComment["ideaId"];
    userId: IIdeaComment["userId"];
    message = new TextFieldStore();

    loadingState = new LoadingStateStore();

    constructor(ideaId: IIdeaComment["ideaId"], userId: IIdeaComment["userId"]) {
        this.ideaId = ideaId;
        this.userId = userId;
        makeAutoObservable(this);
    }

    get canCreateIdeaComment() {
        return this.message.text.length > 1;
    }

    async createIdeaComment() {
        const result = await fetchBackendJson<{ message: string; comment: IIdeaComment }, unknown>(
            "/createIdeaComment",
            "POST",
            {
                body: JSON.stringify({
                    ideaId: this.ideaId,
                    userId: this.userId,
                    message: this.message.text,
                }),
                headers: APPLICATION_JSON_HEADERS,
            },
        );

        if (!result.ok) {
            notifyError(getErrorMessage(result.json));
        }
    }
}
