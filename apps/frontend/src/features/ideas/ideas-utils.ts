import type { IIdeaNote, IdeaState } from "@galadrim-tools/shared";

export function isIdeaBad(reactions: IIdeaNote[]) {
    const downvotes = reactions.reduce((acc, { isUpvote }) => acc + Number(!isUpvote), 0);
    const ratio = reactions.length > 0 ? downvotes / reactions.length : 0;

    return reactions.length > 5 && ratio > 0.7;
}

export function getIdeaVoteCounts(reactions: IIdeaNote[]) {
    const upvotes = reactions.reduce((acc, r) => acc + Number(r.isUpvote), 0);
    const downvotes = reactions.length - upvotes;
    return { upvotes, downvotes };
}

export function getNextIdeaState(state: IdeaState): IdeaState {
    if (state === "TODO") return "DOING";
    if (state === "DOING") return "DONE";
    return "TODO";
}

export function formatRelativeTimeFr(date: Date) {
    const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const abs = Math.abs(deltaSeconds);

    const rtf = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    if (abs < minute) return rtf.format(deltaSeconds, "second");
    if (abs < hour) return rtf.format(Math.round(deltaSeconds / minute), "minute");
    if (abs < day) return rtf.format(Math.round(deltaSeconds / hour), "hour");
    if (abs < month) return rtf.format(Math.round(deltaSeconds / day), "day");
    if (abs < year) return rtf.format(Math.round(deltaSeconds / month), "month");
    return rtf.format(Math.round(deltaSeconds / year), "year");
}

export function formatFullDateFr(date: Date) {
    return date.toLocaleString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
