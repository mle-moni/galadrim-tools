export const queryKeys = {
    me: () => ["me"] as const,
    offices: () => ["offices"] as const,
    officeFloors: () => ["officeFloors"] as const,
    officeRooms: () => ["officeRooms"] as const,
    roomReservations: (officeId: number, dayIso: string) =>
        ["roomReservations", officeId, dayIso] as const,
};
