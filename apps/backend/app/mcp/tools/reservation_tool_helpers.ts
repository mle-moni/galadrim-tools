import OfficeRoom from "#models/office_room";
import type RoomReservation from "#models/room_reservation";
import { isReservationServiceError } from "#services/reservation_errors";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { JSONSchema } from "@jrmc/adonis-mcp/types/method";

export const MCP_TIMEZONE = "Europe/Paris";

export const handleReservationToolErrors = async <T extends JSONSchema>(
    ctx: ToolContext<T>,
    handler: () => Promise<Content | Content[]>,
) => {
    try {
        return await handler();
    } catch (error) {
        if (isReservationServiceError(error)) {
            return [
                ctx.response.error(error.message),
                ctx.response.structured({
                    error: { code: error.code, message: error.message },
                }),
            ];
        }

        throw error;
    }
};

export const compactReservation = (reservation: RoomReservation) => ({
    id: reservation.id,
    title: reservation.title,
    titleComputed: reservation.titleComputed,
    start: reservation.start.toISO(),
    end: reservation.end.toISO(),
    officeRoomId: reservation.officeRoomId,
    userId: reservation.userId,
    resourceUri: `galatools://reservations/${reservation.id}`,
});

export const detailedReservation = (reservation: RoomReservation) => ({
    ...compactReservation(reservation),
    user: reservation.user?.shortData ?? null,
    room: reservation.room
        ? {
              id: reservation.room.id,
              name: reservation.room.name,
              officeFloorId: reservation.room.officeFloorId,
              officeId: reservation.room.officeFloor?.officeId ?? null,
              hasTv: reservation.room.hasTv,
          }
        : null,
});

export const compactRoom = (room: OfficeRoom) => ({
    id: room.id,
    name: room.name,
    officeId: room.officeFloor.officeId,
    officeName: room.officeFloor.office?.name ?? null,
    floor: room.officeFloor.floor,
    officeFloorId: room.officeFloorId,
    hasTv: room.hasTv,
    isBookable: room.isBookable,
});
