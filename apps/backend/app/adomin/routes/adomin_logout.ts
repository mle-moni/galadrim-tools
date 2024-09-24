import User from "#models/user";
import type { HttpContext } from "@adonisjs/core/http";

export const adominLogout = async ({ auth }: HttpContext) => {
    const user = auth.use("api").user;
    const token = user?.currentAccessToken;
    
    if (user && token) await User.accessTokens.delete(user, token.identifier);

    return { message: "Au revoir !" };
};
