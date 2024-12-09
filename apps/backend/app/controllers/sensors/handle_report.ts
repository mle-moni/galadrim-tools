import Sensor from "#models/sensor";
import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";
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
    console.log(DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"));
    const { ID, lux, bat, temp } = await request.validateUsing(validationSchema);
    console.log({ ID, lux, bat, temp });

    const foundSensor = await Sensor.findByOrFail("sensorId", ID);

    await foundSensor
        .merge({
            lastLux: lux,
            lastBat: bat,
            lastTemp: temp,
        })
        .save();

    if (lux > 300) {
        await reservePhoneBox(foundSensor.officeRoomId);
    } else {
        await endPhoneBoxReservation(foundSensor.officeRoomId);
    }

    return { message: "OK" };
};
