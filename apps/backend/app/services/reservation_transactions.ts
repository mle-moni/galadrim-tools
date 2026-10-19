import db from "@adonisjs/lucid/services/db";
import type { TransactionClientContract } from "@adonisjs/lucid/types/database";
import OfficeFloor from "#models/office_floor";
import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import { ReservationServiceError } from "./reservation_errors.js";

export class ReservationLockSetChanged extends Error {}

// A bridge receipt and its mutation share one connection/commit. Legacy callers own theirs.
export function withReservationRooms<T>(
    roomIds: number[],
    operation: (trx: TransactionClientContract) => Promise<T>,
    transaction?: TransactionClientContract,
) {
    const run = async (trx: TransactionClientContract) => {
        for (const id of [...new Set(roomIds)].sort((a, b) => a - b)) {
            const room = await OfficeRoom.query({ client: trx })
                .where("id", id)
                .forUpdate()
                .first();
            if (!room)
                throw new ReservationServiceError("INVALID_ROOM", "La salle n'existe pas", 404);
        }
        return operation(trx);
    };
    return transaction ? run(transaction) : db.transaction(run);
}

export async function withExistingReservation<T>(
    id: number,
    destinationRoomId: number | null,
    operation: (trx: TransactionClientContract, reservation: RoomReservation) => Promise<T>,
    transaction?: TransactionClientContract,
) {
    for (let attempt = 0; attempt < 2; attempt++) {
        const candidate = await RoomReservation.query(transaction ? { client: transaction } : {})
            .where("id", id)
            .firstOrFail();
        const roomIds = [candidate.officeRoomId];
        if (destinationRoomId !== null) roomIds.push(destinationRoomId);
        try {
            return await withReservationRooms(
                roomIds,
                async (trx) => {
                    const current = await RoomReservation.query({ client: trx })
                        .where("id", id)
                        .forUpdate()
                        .firstOrFail();
                    if (!roomIds.includes(current.officeRoomId))
                        throw new ReservationLockSetChanged();
                    return operation(trx, current);
                },
                transaction,
            );
        } catch (error) {
            // An outer transaction must roll back before acquiring a different lock set.
            if (!(error instanceof ReservationLockSetChanged) || transaction) throw error;
        }
    }
    throw new ReservationServiceError(
        "RESERVATION_CHANGED",
        "La réservation a changé. Réessayez.",
        409,
    );
}

// A current locking read prevents a concurrent floor reassignment from escaping office scope.
export async function assertReservationOffice(
    roomId: number,
    officeId: number,
    trx: TransactionClientContract,
) {
    const room = await OfficeRoom.query({ client: trx })
        .where("id", roomId)
        .forUpdate()
        .firstOrFail();
    const floor = await OfficeFloor.query({ client: trx })
        .where("id", room.officeFloorId)
        .forShare()
        .first();
    if (!floor || floor.officeId !== officeId)
        throw new ReservationServiceError("INVALID_ROOM", "La salle n'existe pas", 404);
    return room;
}
