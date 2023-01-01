import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

const notificationsSettingsSchema = schema.create({
    notificationsSettings: schema.number(),
})

export const updateNotificationsSettings = async ({ auth, request }: HttpContextContract) => {
    const user = auth.user!

    const { notificationsSettings } = await request.validate({
        schema: notificationsSettingsSchema,
    })

    user.notificationsSettings = notificationsSettings

    await user.save()

    return { message: 'Paramétres de notification mis à jour' }
}
