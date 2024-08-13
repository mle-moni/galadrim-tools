import BreakTime from "#models/break_time";

export const breakTimesIndex = async () => {
    return BreakTime.all();
};
