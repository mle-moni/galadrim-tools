import { filterNullValues } from "#adomin/cms/utils/array";
import Event from "#models/event";
import RoomReservation from "#models/room_reservation";
import { BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";

const ROOM_NAME_TO_NEW_ROOM_ID: { [K in string]: number } = {
    "Salle Turing": 162,
    "Salle Lovelace": 161,
    "Salle Amesh": 155,
    "La Forêt": 154,
    "Salle du manguier (ultra)-massif": 156,
    "Salle Vador": 149,
    "Salle du Trésor": 139,
    "Salle Méditerranée": 138,
    "L'Olympe": 137,
    "Super Phone Box": 140,
};

export default class MigrateEvents extends BaseCommand {
    static commandName = "migrate:events";
    static description =
        "Allow to migrate events from the old room reservation system to the new one";

    static options: CommandOptions = {
        startApp: true,
    };

    async run() {
        this.logger.info("start migrating events");

        if (!this.app.inProduction) {
            this.logger.error("this command should only be run in production");
            return 1;
        }

        const futureEvents = await Event.query().where("start", ">", new Date());

        const creationDto = futureEvents.map((e) => {
            const officeRoomId = ROOM_NAME_TO_NEW_ROOM_ID[e.room];
            if (!officeRoomId) return null;

            return {
                createdAt: e.createdAt,
                updatedAt: e.updatedAt,
                officeRoomId,
                title: e.title,
                start: e.start,
                end: e.end,
                userId: e.userId,
            };
        });

        await RoomReservation.createMany(filterNullValues(creationDto));
    }
}
