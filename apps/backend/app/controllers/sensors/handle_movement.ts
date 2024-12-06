import env from "#start/env";
import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { reservePhoneBox } from "./reserve_phone_box.js";

const validationSchema = vine.compile(
    vine.object({
        id: vine.number(),
        secret: vine.string(),
    }),
);

export const handleMovement = async ({ request, response }: HttpContext) => {
    const { id, secret } = await request.validateUsing(validationSchema);

    if (secret !== env.get("SENSORS_SECRET")) {
        return response.badRequest({
            error: "secret invalide",
        });
    }

    await reservePhoneBox(id);

    return { message: "OK" };
};
