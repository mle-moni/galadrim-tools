import type { HttpContext } from "@adonisjs/core/http";
import { schema } from "@adonisjs/validator";

const notificationsSettingsSchema = schema.create({
    notificationsSettings: schema.number(),
});

export const updateNotificationsSettings = async ({ auth, request }: HttpContext) => {
    const user = auth.user!;

    const { notificationsSettings } = await request.validate({
        schema: notificationsSettingsSchema,
    });

    user.notificationsSettings = notificationsSettings;

    await user.save();

    return { message: "Paramétres de notification mis à jour" };
};
