import type { GridColumns, GridComparatorFn } from "@mui/x-data-grid";

const timeComparator: GridComparatorFn = (v1, v2) => {
    const [days1, hours1, minutes1] = v1
        // biome-ignore lint/correctness/noUnsafeOptionalChaining: <explanation>
        ?.toString()
        .split(" ")
        .filter((_: string, i: number) => i % 2 === 0);
    const [days2, hours2, minutes2] = v2
        // biome-ignore lint/correctness/noUnsafeOptionalChaining: <explanation>
        ?.toString()
        .split(" ")
        .filter((_: string, i: number) => i % 2 === 0);
    const date1 = new Date(0, 0, +days1, +hours1, +minutes1);
    const date2 = new Date(0, 0, +days2, +hours2, +minutes2);
    return date1.getTime() - date2.getTime();
};

const username = {
    field: "username",
    headerName: "Galadrimeur",
    width: 200,
};
const time = {
    field: "time",
    headerName: "Temps passé dans les salles",
    sortComparator: timeComparator,
    flex: 1,
};
const amount = {
    field: "amount",
    headerName: "Nombre de réservations",
    width: 200,
};
const room = {
    field: "room",
    headerName: "Salle",
    width: 200,
};

export const timeColumns: GridColumns = [username, time];

export const amountColumns: GridColumns = [username, amount];

export const roomColumns: GridColumns = [room, amount, time];
