import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";

const validationSchema = vine.compile(
    vine.object({
        ID: vine.string(),
        temp: vine.number(),
        lux: vine.number(),
        motion: vine.boolean(),
        tamper: vine.boolean(),
        bat: vine.number(),
    }),
);

export const handleReport = async ({ request }: HttpContext) => {
    console.log("--- START REPORT ---");
    console.log(DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"));

    console.log(JSON.stringify(request.all()));

    const { ID } = await request.validateUsing(validationSchema);

    console.log("id", ID);
    console.log("--- END REPORT ---");

    return { message: "OK" };
};
