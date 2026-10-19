import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { roomReservationService } from "#services/room_reservation_service";
import { Ws } from "#services/ws";
import { getOrCreateBotUser } from "./get_or_create_bot_user.js";

export const reservePhoneBox = async (officeRoomId: number) => {
    const botUser = await getOrCreateBotUser();
    const { reservation, created } = await roomReservationService.reservePhoneBox(
        botUser,
        officeRoomId,
    );
    // The service returns only after COMMIT. Existing clients keep the same notifications.
    Ws.io
        .to(CONNECTED_SOCKETS)
        .emit(created ? "createRoomReservation" : "updateRoomReservation", reservation);
    return reservation;
};
