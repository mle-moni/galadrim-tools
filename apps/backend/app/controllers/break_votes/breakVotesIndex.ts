import BreakVote from "#models/break_vote";

export const TODAY_BREAK_VOTE_FILTER =
    "DATE_FORMAT(break_votes.created_at, '%Y-%m-%d') = curdate()";

export const breakVotesIndex = async () => {
    return BreakVote.query()
        .whereRaw(TODAY_BREAK_VOTE_FILTER)
        .preload("activities")
        .preload("times");
};
