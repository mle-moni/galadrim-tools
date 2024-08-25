import { getUserToAuthenticate } from "#services/galadrim_auth";
import env from "#start/env";
import type { HttpContext } from "@adonisjs/core/http";

const getRedirectUrl = () => {
    let apiPath = "/forestLogin";
    if (env.get("BACKEND_URL").endsWith("/")) {
        apiPath = "forestLogin";
    }
    return `${env.get("BACKEND_URL")}${apiPath}`;
};

export const forestLoginRoute = async (ctx: HttpContext) => {
    const user = await getUserToAuthenticate(ctx);

    const redirectUrl = getRedirectUrl();
    if (!user) {
        return ctx.response.redirect(`https://forest.galadrim.fr/login?redirect=${redirectUrl}`);
    }

    await ctx.auth.use("web").login(user, true);

    return ctx.response.redirect(env.get("FRONTEND_URL"));
};
