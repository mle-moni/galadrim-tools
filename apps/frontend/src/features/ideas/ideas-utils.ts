import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { IIdeaNote, IdeaState } from "@galadrim-tools/shared";

const MIN_REACTIONS_FOR_BAD = 6;
const BAD_DOWNVOTE_RATIO = 0.7;

export function isIdeaBad(reactions: IIdeaNote[]) {
    const downvotes = reactions.reduce((acc, { isUpvote }) => acc + Number(!isUpvote), 0);
    const ratio = reactions.length > 0 ? downvotes / reactions.length : 0;

    return reactions.length >= MIN_REACTIONS_FOR_BAD && ratio > BAD_DOWNVOTE_RATIO;
}

export function getIdeaVoteCounts(reactions: IIdeaNote[]) {
    const upvotes = reactions.reduce((acc, r) => acc + Number(r.isUpvote), 0);
    const downvotes = reactions.length - upvotes;
    return { upvotes, downvotes };
}

export function getNextIdeaState(state: IdeaState): IdeaState {
    switch (state) {
        case "TODO":
            return "DOING";
        case "DOING":
            return "DONE";
        default:
            return "TODO";
    }
}

export function formatRelativeTimeFr(date: Date) {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export function formatFullDateFr(date: Date) {
    return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
}
