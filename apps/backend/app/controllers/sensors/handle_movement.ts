import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

const validationSchema = vine.compile(
    vine.object({
        id: vine.number(),
        secret: vine.string(),
    }),
);

export const handleMovement = async ({ request }: HttpContext) => {
    const { id, secret } = await request.validateUsing(validationSchema);

    console.log("sensor ID", id);
    console.log("sensor secret", secret);

    return { message: "Hello world" };
};
