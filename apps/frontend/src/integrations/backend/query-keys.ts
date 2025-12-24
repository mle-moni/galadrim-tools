export const queryKeys = {
    me: () => ["me"] as const,

    // Offices / reservations
    offices: () => ["offices"] as const,
    officeFloors: () => ["officeFloors"] as const,
    officeRooms: () => ["officeRooms"] as const,
    roomReservations: (officeId: number, dayIso: string) =>
        ["roomReservations", officeId, dayIso] as const,

    // Miams (restaurants)
    restaurants: () => ["restaurants"] as const,
    tags: () => ["tags"] as const,
    rewind: (userId: number | null) => ["rewind", userId ?? "me"] as const,

    // Users
    users: () => ["users"] as const,

    // Admin
    adminUserRights: () => ["admin", "userRights"] as const,
    adminDashboard: () => ["admin", "dashboard"] as const,
};
