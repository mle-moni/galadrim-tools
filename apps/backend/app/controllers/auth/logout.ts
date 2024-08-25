import User from "#models/user";
import type { HttpContext } from "@adonisjs/core/http";

export const logoutRoute = async ({ auth, response }: HttpContext) => {
    if (!auth.user) {
        return response.badRequest({ error: `Vous n'êtes pas connecté` });
    }
    if (auth.authenticatedViaGuard === "web") {
        await auth.use("web").logout();
    }
    if (auth.authenticatedViaGuard === "api") {
        const token = auth.use("api").user?.currentAccessToken;
        if (token) await User.accessTokens.delete(auth.user, token.identifier);
    }
    return { notification: "Vous êtes bien déconnecté" };
};
