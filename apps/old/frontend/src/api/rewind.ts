import { fetchBackend } from "./fetch";

export const fetchRewindInfos = async () => {
    const res = await fetchBackend("/rewind");
    if (!res.ok) return [];
    return res.json();
};
