import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from "#adomin/cms/utils/validation";
import Office from "#models/office";
import type { HttpContext } from "@adonisjs/core/http";
import vine, { SimpleMessagesProvider } from "@vinejs/vine";

const changeDefaultOfficeSchema = vine.compile(
    vine.object({
        officeId: vine.number(),
    }),
);

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, {
    officeId: "locaux par défaut",
});

export const changeDefaultOfficeRoute = async ({ request, auth }: HttpContext) => {
    const user = auth.user!;
    const { officeId } = await request.validateUsing(changeDefaultOfficeSchema, {
        messagesProvider,
    });

    await Office.findOrFail(officeId);

    user.officeId = officeId;

    await user.save();

    return { notification: "Paramètres sauvegardés" };
};
