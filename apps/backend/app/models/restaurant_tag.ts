import { BaseModel, column } from "@adonisjs/lucid/orm";
import type { DateTime } from "luxon";

export default class RestaurantTag extends BaseModel {
    static table = "restaurant_tag";

    @column({ isPrimary: true })
    declare id: number;

    @column()
    declare tagId: number;

    @column()
    declare restaurantId: number;

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime;
}
