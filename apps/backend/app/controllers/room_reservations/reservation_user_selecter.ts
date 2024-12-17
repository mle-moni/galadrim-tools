import type User from "#models/user";
import type { RelationQueryBuilderContract } from "@adonisjs/lucid/types/relations";

export const reservationUserSelector = (q: RelationQueryBuilderContract<typeof User, unknown>) =>
    q.select("id", "username", "image", "imageUrl");
