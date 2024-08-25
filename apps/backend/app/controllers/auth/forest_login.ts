import { getUserToAuthenticate } from "#services/galadrim_auth";
import env from "#start/env";
import type { HttpContext } from "@adonisjs/core/http";

export const forestLoginRoute = async (ctx: HttpContext) => {
    const user = await getUserToAuthenticate(ctx);

    const redirectUrl = `${env.get("BACKEND_URL")}/forestLogin`.replace("//", "/");
    if (!user) {
        return ctx.response.redirect(`https://forest.galadrim.fr/login?redirect=${redirectUrl}`);
    }

    await ctx.auth.use("web").login(user, true);

    return ctx.response.redirect(env.get("FRONTEND_URL"));
};
