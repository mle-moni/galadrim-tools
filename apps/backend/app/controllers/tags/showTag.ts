import Tag from "#models/tag";
import type { HttpContext } from "@adonisjs/core/http";

export const showRoute = ({ params }: HttpContext) => {
    return Tag.findOrFail(params.id);
};
