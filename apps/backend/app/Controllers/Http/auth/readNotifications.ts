import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Notification from '#app/Models/Notification'

export const readNotifications = async ({ auth }: HttpContextContract) => {
    const user = auth.user!

    const [notificationsUpdated] = await Notification.query()
        .where('userId', user.id)
        .update('read', true)

    const maxNotification = 20

    if (notificationsUpdated > maxNotification) {
        const notifications = await Notification.query().where('userId', user.id)
        const numberOfNotificationsToDelete = notificationsUpdated - maxNotification
        const lastNotificationToDelete = notifications[numberOfNotificationsToDelete - 1]

        await Notification.query()
            .where('userId', user.id)
            .andWhere('id', '<=', lastNotificationToDelete.id)
            .del()
    }

    return { message: 'Notifications marquées comme lues' }
}
