import crypto from "node:crypto";
import axios from "axios";
import env from "#start/env";

// OpenID Connect login: authorization code flow with PKCE and a client secret. The id_token comes directly from
// the token endpoint over TLS (OpenID Connect Core 3.1.3.7), so its claims are checked, not its signature.

export type SsoPending = { state: string; nonce: string; verifier: string };

export type SsoClaims = {
    iss?: string;
    aud?: string | string[];
    azp?: string;
    exp?: number;
    nonce?: string;
    sub?: string;
    email?: string;
    nickname?: string;
    given_name?: string;
};

const issuer = () => env.get("SSO_ISSUER") || "https://auth.galadrim.fr";
const redirectUri = () => `${env.get("BACKEND_URL").replace(/\/$/, "")}/forestLogin`;

// Enabled once the client is configured.
export const ssoEnabled = () => Boolean(env.get("SSO_CLIENT_ID") && env.get("SSO_CLIENT_SECRET"));

const random = () => crypto.randomBytes(32).toString("base64url");

export const startSso = (): { pending: SsoPending; url: string } => {
    const pending = { state: random(), nonce: random(), verifier: random() };
    const url = new URL(`${issuer()}/oauth/v2/authorize`);
    url.search = new URLSearchParams({
        response_type: "code",
        client_id: env.get("SSO_CLIENT_ID") ?? "",
        redirect_uri: redirectUri(),
        scope: "openid profile email",
        state: pending.state,
        nonce: pending.nonce,
        code_challenge: crypto.createHash("sha256").update(pending.verifier).digest("base64url"),
        code_challenge_method: "S256",
    }).toString();
    return { pending, url: url.toString() };
};

// Returns an error message, or null when the claims are acceptable.
export const checkClaims = (
    claims: SsoClaims,
    expected: { issuer: string; clientId: string; nonce: string; now?: number },
): string | null => {
    if (claims.iss !== expected.issuer) return "unexpected issuer";
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(expected.clientId)) return "token meant for another client";
    if (aud.length > 1 && claims.azp && claims.azp !== expected.clientId)
        return "token issued to another client";
    if (!claims.exp || claims.exp * 1000 <= (expected.now ?? Date.now())) return "token expired";
    if (!expected.nonce || claims.nonce !== expected.nonce) return "invalid nonce";
    if (!claims.email) return "no email in token";
    return null;
};

export const finishSso = async (code: string, pending: SsoPending): Promise<SsoClaims> => {
    const clientId = env.get("SSO_CLIENT_ID") ?? "";
    const { data } = await axios.post(
        `${issuer()}/oauth/v2/token`,
        new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri(),
            code_verifier: pending.verifier,
        }).toString(),
        {
            auth: { username: clientId, password: env.get("SSO_CLIENT_SECRET") ?? "" },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 10000,
        },
    );
    const payload = String(data.id_token ?? "").split(".")[1] ?? "";
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SsoClaims;
    const error = checkClaims(claims, { issuer: issuer(), clientId, nonce: pending.nonce });
    if (error) throw new Error(`SSO id_token rejected: ${error}`);
    return claims;
};

// Username of an account created at its first login.
export const usernameFromClaims = (claims: SsoClaims) =>
    (claims.nickname || claims.given_name || String(claims.email).split("@")[0]).trim();
