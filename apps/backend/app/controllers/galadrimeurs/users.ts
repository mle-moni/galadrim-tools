import User from "#models/user";
import type { HttpContext } from "@adonisjs/core/http";

export const usersRoute = async (_params: HttpContext) => {
    const rawUsers = await User.all();
    return rawUsers.map((user) => user.shortData);
};
