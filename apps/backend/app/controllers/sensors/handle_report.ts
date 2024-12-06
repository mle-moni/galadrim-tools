import Sensor from "#models/sensor";
import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { endPhoneBoxReservation } from "./end_phone_box_reservation.js";
import { reservePhoneBox } from "./reserve_phone_box.js";

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
    const { ID, lux, bat, temp } = await request.validateUsing(validationSchema);
    const foundSensor = await Sensor.findByOrFail("sensorId", ID);

    await foundSensor
        .merge({
            lastLux: lux,
            lastBat: bat,
            lastTemp: temp,
        })
        .save();

    if (lux > 500) {
        await reservePhoneBox(foundSensor.officeRoomId);
    } else {
        await endPhoneBoxReservation(foundSensor.officeRoomId);
    }

    return { message: "OK" };
};
