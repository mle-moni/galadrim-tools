import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../../api/fetch";
import { AppStore } from "../../../globalStores/AppStore";
import { LoadingStateStore } from "../../../reusableComponents/form/LoadingStateStore";
import { TextFieldStore } from "../../../reusableComponents/form/TextFieldStore";
import { notifyError, notifySuccess } from "../../../utils/notification";
import { APPLICATION_JSON_HEADERS } from "../../idea/createIdea/CreateIdeaStore";

type Option = {
    label: string;
    value: number;
};
export class NotificationsAdminStore {
    loadingState = new LoadingStateStore();

    usersValue: Option[] = [];

    title = new TextFieldStore();
    text = new TextFieldStore();
    link = new TextFieldStore();

    constructor() {
        makeAutoObservable(this);
    }

    setUsersValue(opts: Option[]) {
        this.usersValue = opts;
    }

    getBody() {
        return {
            userIds: this.usersValue.map(({ value }) => value),
            title: this.title.text,
            text: this.text.text,
            link: this.link.text,
        };
    }

    async createNotification() {
        const body = JSON.stringify(this.getBody());
        this.loadingState.setIsLoading(true);
        const res = await fetchBackendJson("/admin/createNotification", "POST", {
            body,
            headers: APPLICATION_JSON_HEADERS,
        });
        this.loadingState.setIsLoading(false);

        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, "Impossible de créer la notification, bizarre"),
            );
        }
        notifySuccess("La notification a bien été envoyée !");
    }

    get canCreateNotification() {
        return !this.loadingState.isLoading;
    }

    get userOptions() {
        return AppStore.usersArray.map(({ id, username }) => ({
            value: id,
            label: username,
        }));
    }
}
