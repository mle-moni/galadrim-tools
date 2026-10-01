import { test } from "@japa/runner";
import { checkClaims, usernameFromClaims } from "#services/sso";

const expected = { issuer: "https://auth.galadrim.fr", clientId: "tools", nonce: "n" };
const valid = {
    iss: "https://auth.galadrim.fr",
    aud: ["tools", "project"],
    azp: "tools",
    exp: Date.now() / 1000 + 60,
    nonce: "n",
    sub: "184",
    email: "someone@galadrim.fr",
};

test.group("SSO id_token checks", () => {
    test("a valid token passes", ({ assert }) => {
        assert.isNull(checkClaims(valid, expected));
    });

    test("another issuer, audience, authorized party or nonce is refused", ({ assert }) => {
        assert.isNotNull(checkClaims({ ...valid, iss: "https://elsewhere" }, expected));
        assert.isNotNull(checkClaims({ ...valid, aud: ["other"] }, expected));
        assert.isNotNull(checkClaims({ ...valid, azp: "other" }, expected));
        assert.isNotNull(checkClaims({ ...valid, nonce: "x" }, expected));
    });

    test("an expired token or one without email is refused", ({ assert }) => {
        assert.isNotNull(checkClaims({ ...valid, exp: Date.now() / 1000 - 1 }, expected));
        assert.isNotNull(checkClaims({ ...valid, email: undefined }, expected));
    });
});

test.group("SSO account name", () => {
    test("nickname first, then the first name, then the start of the email", ({ assert }) => {
        assert.equal(
            usernameFromClaims({ ...valid, nickname: " Alex B ", given_name: "Alex" }),
            "Alex B",
        );
        assert.equal(usernameFromClaims({ ...valid, given_name: "Alex" }), "Alex");
        assert.equal(usernameFromClaims(valid), "someone");
    });
});
