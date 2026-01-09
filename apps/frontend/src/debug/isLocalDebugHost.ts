export function isLocalDebugHost(): boolean {
    const hostname = globalThis.window?.location?.hostname ?? "";
    return hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname === "::1";
}
