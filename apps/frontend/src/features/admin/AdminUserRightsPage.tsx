import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
    fetchUserRights,
    updateUserRights,
    type ApiUserRights,
} from "@/integrations/backend/admin";
import { queryKeys } from "@/integrations/backend/query-keys";
import { RIGHTS, type AllRights, hasRights } from "@/lib/rights";

const RIGHTS_DEFINITIONS: Array<{ key: Exclude<AllRights, "DEFAULT">; label: string }> = [
    { key: "USER_ADMIN", label: "USER_ADMIN" },
    { key: "EVENT_ADMIN", label: "EVENT_ADMIN" },
    { key: "RIGHTS_ADMIN", label: "RIGHTS_ADMIN" },
    { key: "MIAM_ADMIN", label: "MIAM_ADMIN" },
    { key: "DASHBOARD_ADMIN", label: "DASHBOARD_ADMIN" },
    { key: "IDEAS_ADMIN", label: "IDEAS_ADMIN" },
    { key: "NOTIFICATION_ADMIN", label: "NOTIFICATION_ADMIN" },
    { key: "CODE_NAMES_ADMIN", label: "CODE_NAMES_ADMIN" },
];

export default function AdminUserRightsPage() {
    const queryClient = useQueryClient();

    const userRightsQuery = useQuery({
        queryKey: queryKeys.adminUserRights(),
        queryFn: fetchUserRights,
        retry: false,
    });

    const users = userRightsQuery.data ?? [];

    const [selectedUserId, setSelectedUserId] = useState<number | "">("");
    const [editedRights, setEditedRights] = useState(0);

    const selectedUser = useMemo(() => {
        if (selectedUserId === "") return null;
        return users.find((u) => u.id === selectedUserId) ?? null;
    }, [selectedUserId, users]);

    useEffect(() => {
        if (selectedUserId !== "") return;
        if (users.length === 0) return;
        setSelectedUserId(users[0]!.id);
    }, [selectedUserId, users]);

    useEffect(() => {
        if (selectedUserId === "") return;
        const user = users.find((u) => u.id === selectedUserId);
        if (!user) return;
        setEditedRights(user.rights);
    }, [selectedUserId, users]);

    const saveMutation = useMutation({
        mutationFn: updateUserRights,
        onSuccess: (_data, input) => {
            queryClient.setQueryData<ApiUserRights[]>(queryKeys.adminUserRights(), (old) => {
                if (!old) return old;
                return old.map((user) =>
                    user.id === input.id ? { ...user, rights: input.rights } : user,
                );
            });
        },
    });

    const canEdit = selectedUserId !== "" && Boolean(selectedUser);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Droits des utilisateurs</CardTitle>
                <CardDescription>
                    Sélectionnez un utilisateur puis activez/désactivez ses droits.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="admin-rights-user">Utilisateur</Label>
                    <select
                        id="admin-rights-user"
                        value={selectedUserId}
                        disabled={userRightsQuery.isLoading || userRightsQuery.isError}
                        onChange={(e) => {
                            const next = e.target.value === "" ? "" : Number(e.target.value);
                            setSelectedUserId(next);
                        }}
                        className="border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]"
                    >
                        {users.length === 0 ? (
                            <option value="" disabled>
                                Aucun utilisateur
                            </option>
                        ) : (
                            users
                                .slice()
                                .sort((a, b) => a.username.localeCompare(b.username))
                                .map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.username}
                                    </option>
                                ))
                        )}
                    </select>
                </div>

                <div className="grid gap-2">
                    {RIGHTS_DEFINITIONS.map((def) => {
                        const checked = hasRights(editedRights, [def.key]);

                        return (
                            <div
                                key={def.key}
                                className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-1.5"
                            >
                                <div className="min-w-0 text-sm font-medium">{def.label}</div>
                                <Switch
                                    checked={checked}
                                    disabled={!canEdit || saveMutation.isPending}
                                    onCheckedChange={() => {
                                        if (!canEdit) return;
                                        const shouldEnable = !checked;
                                        const delta = shouldEnable
                                            ? RIGHTS[def.key]
                                            : -RIGHTS[def.key];
                                        setEditedRights((prev) => prev + delta);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={() => {
                        if (selectedUserId === "") return;
                        if (!selectedUser) return;

                        const promise = saveMutation.mutateAsync({
                            id: selectedUserId,
                            rights: editedRights,
                        });
                        toast.promise(promise, {
                            loading: "Sauvegarde…",
                            success: (data) => data.notification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de sauvegarder les droits",
                        });
                    }}
                    disabled={!canEdit || saveMutation.isPending}
                >
                    {saveMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                        "Sauvegarder"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
