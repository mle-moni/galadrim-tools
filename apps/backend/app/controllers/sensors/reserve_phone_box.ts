import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import type User from "#models/user";
import { Ws } from "#services/ws";
import { DateTime } from "luxon";
import { getOrCreateBotUser } from "./get_or_create_bot_user.js";

export const reservePhoneBox = async (officeRoomId: number) => {
    const botUser = await getOrCreateBotUser();
    const phoneBox = await OfficeRoom.query()
        .where("id", officeRoomId)
        .andWhere("is_phonebox", true)
        .firstOrFail();
    const lastReservation = await RoomReservation.query()
        .where("officeRoomId", phoneBox.id)
        .where("userId", botUser.id)
        .andWhere("end", ">", new Date())
        .orderBy("end", "desc")
        .first();

    if (!lastReservation) {
        return makeNewReservation(phoneBox, botUser);
    }

    lastReservation.end = DateTime.now().plus({ hours: 2 });

    await lastReservation.save();

    await lastReservation.load("user");

    Ws.io.to(CONNECTED_SOCKETS).emit("updateRoomReservation", lastReservation);

    return lastReservation;
};

const makeNewReservation = async (phoneBox: OfficeRoom, botUser: User) => {
    const reservation = await RoomReservation.create({
        title: null,
        officeRoomId: phoneBox.id,
        userId: botUser.id,
        start: DateTime.now(),
        end: DateTime.now().plus({ hours: 2 }),
    });

    await reservation.load("user");

    Ws.io.to(CONNECTED_SOCKETS).emit("createRoomReservation", reservation);

    return reservation;
};
