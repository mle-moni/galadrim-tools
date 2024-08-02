import BreakActivity from "#models/break_activity";

export const breakActivitiesIndex = async () => {
    return BreakActivity.all();
};
