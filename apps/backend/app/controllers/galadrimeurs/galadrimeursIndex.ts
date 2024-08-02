import User from "#models/user";
import type { HttpContext } from "@adonisjs/core/http";

export const indexRoute = async (_params: HttpContext) => {
    const users = await User.all();
    return users.map((user) => user.username).sort();
};
