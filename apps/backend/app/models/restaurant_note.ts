import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { INotes, NotesOption } from "@galadrim-tools/shared";
import type { DateTime } from "luxon";

export default class RestaurantNote extends BaseModel {
    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare restaurantId: number;

    @column()
    declare userId: number;

    @column()
    declare note: NotesOption;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;

    get frontendData(): INotes {
        return {
            id: this.id,
            restaurantId: this.restaurantId,
            userId: this.userId,
            note: this.note,
            updatedAt: this.updatedAt.toString(),
        };
    }
}
