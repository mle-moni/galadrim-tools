import OfficeRoom from "#models/office_room";
import RoomReservation from "#models/room_reservation";
import type { HttpContext } from "@adonisjs/core/http";

export const availableRooms = async ({ auth, request, response }: HttpContext) => {
    const user = auth.user!;
    const queryString = request.qs();
    const start = queryString.start ?? null;
    const end = queryString.end ?? null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const invalidDate =
        startDate.toString() === "Invalid Date" || endDate.toString() === "Invalid Date";

    if (invalidDate || !start || !end) {
        return response.badRequest({
            error: "Invalid Date",
        });
    }

    const allRoomsQuery = OfficeRoom.query().select("id", "name").where("is_bookable", true);
    const officeId = user.officeId;
    if (officeId) {
        allRoomsQuery.whereHas("officeFloor", (builder) => builder.where("office_id", officeId));
    }
    const allRooms: { id: number; name: string }[] = await allRoomsQuery;

    // get all events with dates incompatible with the new event
    const res = await RoomReservation.query()
        .where("end", ">", startDate)
        .andWhere("start", "<", endDate);

    const unavailableRooms = new Set(res.map((resa) => resa.officeRoomId));

    return allRooms.filter((room) => !unavailableRooms.has(room.id));
};
