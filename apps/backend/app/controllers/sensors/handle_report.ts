import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";

const validationSchema = vine.compile(
    vine.object({
        id: vine.any(),
        temp: vine.any(),
        lux: vine.any(),
        motion: vine.any(),
        tamper: vine.any(),
        bat: vine.any(),
    }),
);

export const handleReport = async ({ request }: HttpContext) => {
    console.log("--- START REPORT ---");
    console.log(DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"));

    const { id, bat, tamper, motion, lux, temp } = await request.validateUsing(validationSchema);

    console.log("id", id);
    console.log("bat", bat);
    console.log("tamper", tamper);
    console.log("motion", motion);
    console.log("lux", lux);
    console.log("temp", temp);
    console.log("--- END REPORT ---");

    return { message: "OK" };
};
