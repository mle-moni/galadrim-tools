import User from "#models/user";
import { cuid } from "@adonisjs/core/helpers";

export const getOrCreateBotUser = async () => {
    const botUser = await User.findBy("email", "bot@galadrim.fr");

    if (botUser) return botUser;

    return await User.create({
        email: "bot@galadrim.fr",
        password: cuid(),
        username: "Galabot",
    });
};
