import moment from "moment";
import "moment/dist/locale/fr";

moment.locale("fr");

export const getHumanFormattedTimeDifference = (date?: Date | string) => {
    if (!date) return "";
    return moment(date).fromNow();
};

export const getHumanFormattedDate = (date?: Date | string) => {
    if (!date) return "";
    return moment(date).format("DD/MM/YYYY HH:mm");
};

export const getHumanFormattedDay = (date?: Date | string) => {
    if (!date) return "";
    return moment(date).format("DD/MM/YYYY");
};
