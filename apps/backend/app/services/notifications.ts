import Notification from "#models/notification";
import User from "#models/user";
import { hasNotificationEnabled, type NotificationName } from "@galadrim-tools/shared";
import { Ws } from "./ws.js";

export interface NotificationParams {
    title: string;
    text: string;
    link?: string;
    type: NotificationName;
}

export const createNotificationForUser = async (
    { text, title, link, type }: NotificationParams,
    user: User,
) => {
    if (hasNotificationEnabled(user.notificationsSettings, type) === false) {
        return;
    }

    const notification = await Notification.create({
        text,
        title,
        userId: user.id,
        link: link ?? null,
    });
    Ws.io.to(user.personalSocket).emit("notification", notification);
};

export const createNotificationForUsers = async (params: NotificationParams, exceptUserId = -1) => {
    const users = await User.query().whereNot("id", exceptUserId);

    const promises = users.map((user) => createNotificationForUser(params, user));

    await Promise.all(promises);
};

export const cropText = (text: string, limit = 30) => {
    if (text.length <= limit) return text;

    const cropMark = " [...]";

    return text.slice(0, limit - cropMark.length) + cropMark;
};
