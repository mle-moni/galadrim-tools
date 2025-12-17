import { LoadingStateStore } from "../../../reusableComponents/form/LoadingStateStore";
import { makeAutoObservable } from "mobx";
import { TextFieldStore } from "../../../reusableComponents/form/TextFieldStore";
import { CheckboxFieldStore } from "../../../reusableComponents/form/CheckboxFieldStore";
import { fetchBackendJson, getErrorMessage } from "../../../api/fetch";
import type { IIdea } from "@galadrim-tools/shared";
import { notifyError } from "../../../utils/notification";

export type CreateIdeaCallback = Parameters<CreateIdeaStore["createIdea"]>[0];

export const APPLICATION_JSON_HEADERS = [["Content-Type", "application/json"]] as [
    string,
    string,
][];
export class CreateIdeaStore {
    text = new TextFieldStore();
    isAnonymous = new CheckboxFieldStore();

    loadingState = new LoadingStateStore();

    constructor() {
        makeAutoObservable(this);
    }

    get canCreateIdea() {
        return this.text.text.length > 3;
    }

    async createIdea(onPublish: (idea: IIdea) => void) {
        const result = await fetchBackendJson<{ message: string; idea: IIdea }, unknown>(
            "/ideas",
            "POST",
            {
                body: JSON.stringify({
                    text: this.text.text,
                    isAnonymous: this.isAnonymous.checked,
                }),
                headers: APPLICATION_JSON_HEADERS,
            },
        );

        if (result.ok) {
            onPublish(result.json.idea);
        } else {
            notifyError(getErrorMessage(result.json));
        }
    }
}
