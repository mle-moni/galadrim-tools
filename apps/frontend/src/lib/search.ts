export function normalizeSearchText(input: string | null | undefined): string {
    if (!input) return "";

    return input.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
