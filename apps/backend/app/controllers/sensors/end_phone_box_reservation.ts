import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { roomReservationService } from "#services/room_reservation_service";
import { Ws } from "#services/ws";
import { getOrCreateBotUser } from "./get_or_create_bot_user.js";

export const endPhoneBoxReservation = async (officeRoomId: number) => {
    const botUser = await getOrCreateBotUser();
    const reservation = await roomReservationService.endPhoneBox(botUser, officeRoomId);
    if (reservation) Ws.io.to(CONNECTED_SOCKETS).emit("updateRoomReservation", reservation);
};
