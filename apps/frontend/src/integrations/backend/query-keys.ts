export const queryKeys = {
    me: () => ["me"] as const,

    // Offices / reservations
    offices: () => ["offices"] as const,
    officeFloors: () => ["officeFloors"] as const,
    officeRooms: () => ["officeRooms"] as const,
    roomReservations: (officeId: number | null, dayIso: string) =>
        ["roomReservations", officeId, dayIso] as const,

    // Miams (restaurants)
    restaurants: () => ["restaurants"] as const,
    tags: () => ["tags"] as const,
    rewind: (userId: number | null) => ["rewind", { userId: userId ?? "me" }] as const,

    // Ideas
    ideas: () => ["ideas"] as const,

    // Users
    users: () => ["users"] as const,

    // Games
    portraitGuessGame: () => ["portraitGuessGame"] as const,
    matrices: () => ["matrices"] as const,
    codeNamesGames: () => ["codeNamesGames"] as const,

    // Admin
    adminUserRights: () => ["admin", "userRights"] as const,
    adminDashboard: () => ["admin", "dashboard"] as const,
};
