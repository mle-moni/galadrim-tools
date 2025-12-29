import { describe, expect, it } from "vitest";

import { normalizeSearchText } from "./search";

describe("normalizeSearchText", () => {
    it("returns empty string for nullish/blank values", () => {
        expect(normalizeSearchText(undefined)).toBe("");
        expect(normalizeSearchText(null)).toBe("");
        expect(normalizeSearchText("")).toBe("");
        expect(normalizeSearchText("   ")).toBe("");
    });

    it("trims and lowercases", () => {
        expect(normalizeSearchText("  JoSe ")).toBe("jose");
    });

    it("removes diacritics (precomposed)", () => {
        expect(normalizeSearchText("José")).toBe("jose");
        expect(normalizeSearchText("Élève")).toBe("eleve");
        expect(normalizeSearchText("Ångström")).toBe("angstrom");
    });

    it("removes diacritics (combining marks)", () => {
        const decomposedJose = "Jo\u0301se"; // Jóse
        expect(normalizeSearchText(decomposedJose)).toBe("jose");

        const decomposedEleve = "e\u0301le\u0300ve"; // élève
        expect(normalizeSearchText(decomposedEleve)).toBe("eleve");
    });
});
