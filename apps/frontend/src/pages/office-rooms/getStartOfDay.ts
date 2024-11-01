export const getStartOfDay = () => {
    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    return startDate;
};
