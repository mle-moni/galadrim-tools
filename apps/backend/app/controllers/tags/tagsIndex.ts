import Tag from "#models/tag";
import type { HttpContext } from "@adonisjs/core/http";

export const indexRoute = async (_params: HttpContext) => {
    return Tag.all();
};
