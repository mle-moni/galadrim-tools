import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../api/fetch";
import type { MainStore } from "../../globalStores/AppStore";
import { LoadingStateStore } from "../../reusableComponents/form/LoadingStateStore";
import { SimpleModalStore } from "../../reusableComponents/modal/SimpleModalStore";
import { notifyError } from "../../utils/notification";

export class NotificationsComponentStore {
    loadingState = new LoadingStateStore();

    modalStore = new SimpleModalStore();

    constructor(private appStore: MainStore) {
        makeAutoObservable(this);
    }

    get notifications() {
        return this.appStore.authStore.user.notifications;
    }

    get unread() {
        return this.notifications.filter(({ read }) => !read);
    }

    async readNotifications() {
        const res = await fetchBackendJson("/readNotifications", "POST");
        if (!res.ok) {
            return notifyError(
                getErrorMessage(
                    res.json,
                    "Impossible de mettre les notifications comme lues, bizarre",
                ),
            );
        }
    }

    showNotifications() {
        this.modalStore.setModalOpen(true);
        this.readNotifications();
    }

    linkClicked(link: string | null) {
        if (link === null) return;
        this.closeModal();
        if (link.startsWith("http")) {
            window.open(link);
        } else {
            this.appStore.navigate(link);
        }
    }

    closeModal() {
        this.appStore.authStore.readNotifications();
        this.modalStore.setModalOpen(false);
    }
}
