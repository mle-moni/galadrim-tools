const SIDEBAR_COOKIE_NAME = "sidebar_state";

export function getSidebarStateFromCookie(): boolean {
    if (typeof document === "undefined") return true;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === SIDEBAR_COOKIE_NAME) {
            return value === "true";
        }
    }

    return true;
}
