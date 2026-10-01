import type { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";
import { getOrCreateSsoUser, getUserToAuthenticate } from "#services/galadrim_auth";
import {
    type SsoPending,
    finishSso,
    ssoEnabled,
    startSso,
    usernameFromClaims,
} from "#services/sso";
import env from "#start/env";

const getRedirectUrl = () => {
    let apiPath = "/forestLogin";
    if (env.get("BACKEND_URL").endsWith("/")) {
        apiPath = "forestLogin";
    }
    return `${env.get("BACKEND_URL")}${apiPath}`;
};

// The same route starts the SSO login (no `code`) and receives its answer.
const ssoLoginRoute = async (ctx: HttpContext) => {
    const { request, response, session } = ctx;
    const code = request.input("code");

    if (!code) {
        const { pending, url } = startSso();
        session.put("sso", pending);
        return response.redirect(url);
    }

    const pending = session.pull("sso") as SsoPending | undefined;
    if (!pending || request.input("state") !== pending.state) {
        // Stale login attempt: start again.
        return response.redirect(getRedirectUrl());
    }

    try {
        const claims = await finishSso(String(code), pending);
        const user = await getOrCreateSsoUser(String(claims.email), usernameFromClaims(claims));
        await ctx.auth.use("web").login(user, true);
        return response.redirect(env.get("FRONTEND_URL"));
    } catch (error) {
        logger.error({ err: error }, "SSO login failed");
        return response.redirect(`${env.get("FRONTEND_URL")}/login`);
    }
};

export const forestLoginRoute = async (ctx: HttpContext) => {
    if (ssoEnabled()) return ssoLoginRoute(ctx);

    const user = await getUserToAuthenticate(ctx);

    const redirectUrl = getRedirectUrl();
    if (!user) {
        return ctx.response.redirect(`https://forest.galadrim.fr/login?redirect=${redirectUrl}`);
    }

    await ctx.auth.use("web").login(user, true);

    return ctx.response.redirect(env.get("FRONTEND_URL"));
};
