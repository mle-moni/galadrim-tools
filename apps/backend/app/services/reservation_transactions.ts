import db from "@adonisjs/lucid/services/db";
import type { TransactionClientContract } from "@adonisjs/lucid/types/database";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import { ReservationServiceError } from "./reservation_errors.js";

class ReservationLockSetChanged extends Error {}

// Allocation-service orchestration shared by HTTP, MCP and phone-box commands.
export function withReservationRooms<T>(
    roomIds: number[],
    operation: (trx: TransactionClientContract) => Promise<T>,
) {
    return db.transaction(async (trx) => {
        const sorted = [...new Set(roomIds)].sort((a, b) => a - b);
        for (const id of sorted) {
            const room = await OfficeRoom.query({ client: trx })
                .where("id", id)
                .forUpdate()
                .first();
            if (!room)
                throw new ReservationServiceError("INVALID_ROOM", "La salle n'existe pas", 404);
        }
        return operation(trx);
    });
}

export async function withExistingReservation<T>(
    id: number,
    destinationRoomId: number | null,
    operation: (trx: TransactionClientContract, reservation: RoomReservation) => Promise<T>,
) {
    for (let attempt = 0; attempt < 2; attempt++) {
        const candidate = await RoomReservation.query().where("id", id).firstOrFail();
        const roomIds = [candidate.officeRoomId];
        if (destinationRoomId !== null) roomIds.push(destinationRoomId);
        try {
            return await withReservationRooms(roomIds, async (trx) => {
                const current = await RoomReservation.query({ client: trx })
                    .where("id", id)
                    .forUpdate()
                    .firstOrFail();
                if (!roomIds.includes(current.officeRoomId)) throw new ReservationLockSetChanged();
                return operation(trx, current);
            });
        } catch (error) {
            if (!(error instanceof ReservationLockSetChanged)) throw error;
        }
    }
    throw new ReservationServiceError(
        "RESERVATION_CHANGED",
        "La réservation a changé. Réessayez.",
        409,
    );
}
