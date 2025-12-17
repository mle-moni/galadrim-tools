import type { IIdea } from "@galadrim-tools/shared";

export const getUsersIdWithSpecificReaction = (idea: IIdea, reaction: boolean) => {
    return idea.reactions.filter((r) => r.isUpvote === reaction).map((r) => r.userId);
};
