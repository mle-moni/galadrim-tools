import type { ApiError } from "@galadrim-tools/shared";
import { fetchBackendJson } from "../../api/fetch";
import { notifyError, notifySuccess } from "../../utils/notification";
import { type ApiToken, clipboardCopy } from "./WhoamiStore";

export const createApiToken = async () => {
    const res = await fetchBackendJson<ApiToken, ApiError>("/createApiToken", "POST");
    if (res.ok) {
        clipboardCopy(res.json.token, {
            success: () => {
                notifySuccess("API token copié dans le presse papier");
            },
            error: () => {
                console.log("%c*********** API TOKEN ***********", "color: #4287f5");
                console.log(`%c${res.json.token}`, "color: #a442f5");
                console.log("%c*********************************", "color: #4287f5");
                notifyError(
                    "Impossible de copier dans le presse papier, ouvrez la console pour récupérer le token",
                );
            },
        });
    }
};
