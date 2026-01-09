import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

import { createAdminNotification } from "@/integrations/backend/admin";
import { usersQueryOptions } from "@/integrations/backend/users";

const textareaClassName =
    "border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]";

export default function AdminNotificationsPage() {
    const usersQuery = useQuery(usersQueryOptions());

    const [sendToEveryone, setSendToEveryone] = useState(true);
    const [userSearch, setUserSearch] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [link, setLink] = useState("");

    const createNotificationMutation = useMutation({
        mutationFn: createAdminNotification,
        onSuccess: () => {
            setTitle("");
            setText("");
            setLink("");
            setSelectedUserIds(new Set());
            setSendToEveryone(true);
            setUserSearch("");
        },
    });

    const users = usersQuery.data ?? [];

    const filteredUsers = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => u.username.toLowerCase().includes(q));
    }, [userSearch, users]);

    const canSend =
        title.trim().length >= 2 &&
        text.trim().length >= 2 &&
        (sendToEveryone || selectedUserIds.size > 0) &&
        !createNotificationMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Envoyer une notification</CardTitle>
                <CardDescription>
                    Laissez la liste vide pour envoyer à tout le monde (comportement backend).
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 px-4 py-3">
                    <div className="min-w-0">
                        <div className="text-sm font-medium">Envoyer à tout le monde</div>
                        <div className="text-xs text-muted-foreground">
                            Si activé, aucun utilisateur n'est sélectionné.
                        </div>
                    </div>
                    <Switch
                        checked={sendToEveryone}
                        disabled={createNotificationMutation.isPending}
                        onCheckedChange={(checked) => {
                            setSendToEveryone(checked);
                            if (checked) {
                                setSelectedUserIds(new Set());
                            }
                        }}
                    />
                </div>

                {!sendToEveryone && (
                    <div className="grid gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="admin-notifications-user-search">Filtrer</Label>
                            <Input
                                id="admin-notifications-user-search"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Rechercher un utilisateur…"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Destinataires ({selectedUserIds.size})</Label>
                            <ScrollArea className="h-56 rounded-md border border-border/60">
                                <div className="flex flex-col gap-2 p-3">
                                    {usersQuery.isLoading && (
                                        <div className="text-sm text-muted-foreground">
                                            Chargement…
                                        </div>
                                    )}
                                    {usersQuery.isError && (
                                        <div className="text-sm text-muted-foreground">
                                            Impossible de charger les utilisateurs.
                                        </div>
                                    )}
                                    {!usersQuery.isLoading && filteredUsers.length === 0 && (
                                        <div className="text-sm text-muted-foreground">
                                            Aucun résultat.
                                        </div>
                                    )}
                                    {filteredUsers.map((u) => {
                                        const checked = selectedUserIds.has(u.id);
                                        return (
                                            <button
                                                key={u.id}
                                                type="button"
                                                className="flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-1.5 text-left hover:bg-muted/30"
                                                onClick={() => {
                                                    setSelectedUserIds((prev) => {
                                                        const next = new Set(prev);
                                                        if (next.has(u.id)) next.delete(u.id);
                                                        else next.add(u.id);
                                                        return next;
                                                    });
                                                }}
                                            >
                                                <span className="text-sm">{u.username}</span>
                                                <Switch
                                                    checked={checked}
                                                    onCheckedChange={() => {
                                                        setSelectedUserIds((prev) => {
                                                            const next = new Set(prev);
                                                            if (next.has(u.id)) next.delete(u.id);
                                                            else next.add(u.id);
                                                            return next;
                                                        });
                                                    }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="admin-notifications-title">Titre</Label>
                    <Input
                        id="admin-notifications-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="admin-notifications-text">Texte</Label>
                    <textarea
                        id="admin-notifications-text"
                        className={textareaClassName}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="admin-notifications-link">Lien (optionnel)</Label>
                    <Input
                        id="admin-notifications-link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://…"
                    />
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={() => {
                        const userIds = sendToEveryone ? [] : Array.from(selectedUserIds);
                        const promise = createNotificationMutation.mutateAsync({
                            userIds,
                            title: title.trim(),
                            text: text.trim(),
                            link: link.trim() === "" ? undefined : link.trim(),
                        });
                        toast.promise(promise, {
                            loading: "Envoi…",
                            success: (data) => data.notification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible d'envoyer la notification",
                        });
                    }}
                    disabled={!canSend}
                >
                    {createNotificationMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                        "Envoyer"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
