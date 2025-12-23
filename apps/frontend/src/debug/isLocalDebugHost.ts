export function isLocalDebugHost(): boolean {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname;
    return hostname.includes("localhost") || hostname.includes("127.0.0.1") || hostname === "::1";
}
