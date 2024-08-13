import { makeAutoObservable } from "mobx";
import { createApiToken } from "./createApiToken";

export type ApiToken = {
    type: "bearer";
    token: string;
};

export class WhoamiStore {
    public clickCount = 0;

    constructor() {
        makeAutoObservable(this);
    }

    incrementClickCount() {
        ++this.clickCount;
    }

    onClick() {
        this.incrementClickCount();
        if (this.clickCount === 5) {
            this.createApiToken();
        }
    }

    async createApiToken() {
        return createApiToken();
    }
}

export async function clipboardCopy(
    text: string,
    { success, error }: { success: () => void; error: () => void },
) {
    const permissions = await navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: "clipboard-write",
    });
    if (permissions.state === "granted" || permissions.state === "prompt") {
        await navigator.clipboard.writeText(text);
        success();
        return;
    }
    error();
}
