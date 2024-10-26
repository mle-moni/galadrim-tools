import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { type UserData, fetchUsers } from "../../api/galadrimeurs";

export const useUserSelect = () => {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });

    const usersOptions = useMemo(() => {
        if (!usersQuery.data) return [];

        const options = usersQuery.data
            .slice()
            .reverse() // old users first (they are more likely to have a picture)
            .map((user) => ({
                label: user.username,
                value: user.id,
                imageUrl: user.imageUrl,
            }));

        return options;
    }, [usersQuery.data]);

    const selectedUser = useMemo(() => {
        if (!usersQuery.data) return null;

        return usersQuery.data.find((user) => user.id === selectedUserId) ?? null;
    }, [usersQuery.data, selectedUserId]);

    const setSelectedUser = (user: UserData | null) => {
        setSelectedUserId(user?.id ?? null);
    };

    const setSelectedUserFromId = (id: number | null) => {
        if (id === null) {
            setSelectedUser(null);
            return;
        }
        const user = usersQuery.data?.find((user) => user.id === id);
        if (!user) return;
        setSelectedUser(user);
    };

    const selectedUserOption =
        usersOptions.find((option) => option.value === selectedUserId) ?? null;

    return {
        usersOptions,
        selectedUser,
        selectedUserId: selectedUser?.id ?? null,
        setSelectedUserFromId,
        selectedUserOption,
    };
};
