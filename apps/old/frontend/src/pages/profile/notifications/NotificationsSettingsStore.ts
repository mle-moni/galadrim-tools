import {
    hasNotificationEnabled,
    type NotificationName,
    NOTIFICATIONS,
} from "@galadrim-tools/shared";
import { makeAutoObservable } from "mobx";
import { fetchBackendJson, getErrorMessage } from "../../../api/fetch";
import type { AuthStore } from "../../../globalStores/AuthStore";
import { closeAllSnackbars, notifyError, notifySuccess } from "../../../utils/notification";

export class NotificationSettingsStore {
    constructor(private authStore: AuthStore) {
        makeAutoObservable(this);
    }

    get settings() {
        return this.authStore.user.notificationsSettings;
    }

    async toggleNotification(notification: NotificationName) {
        const shouldAddSetting = !hasNotificationEnabled(this.settings, notification);
        const notificationInteger = shouldAddSetting
            ? NOTIFICATIONS[notification]
            : -NOTIFICATIONS[notification];
        const newNotificationsSettings = this.settings + notificationInteger;

        closeAllSnackbars();

        const body = new FormData();
        body.append("notificationsSettings", newNotificationsSettings.toString());

        const res = await fetchBackendJson<{ message: string }, unknown>(
            "/updateNotificationsSettings",
            "POST",
            { body },
        );
        if (!res.ok) {
            return notifyError(
                getErrorMessage(res.json, "Impossible de mettre à jour ce paramétre, bizarre"),
            );
        }

        this.authStore.setUserNotificationSetting(newNotificationsSettings);
        notifySuccess(res.json.message);
    }

    hasNotificationEnabled(notification: NotificationName) {
        return hasNotificationEnabled(this.settings, notification);
    }
}
