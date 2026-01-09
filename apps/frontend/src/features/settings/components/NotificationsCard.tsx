import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export type NotificationToggleItem<Key extends string> = {
    key: Key;
    title: string;
    description: string;
};

interface NotificationsCardProps<Key extends string> {
    items: readonly NotificationToggleItem<Key>[];
    isEnabled: (key: Key) => boolean;
    disabled: boolean;
    onToggle: (key: Key) => Promise<{ message: string }>;
}

export default function NotificationsCard<Key extends string>({
    items,
    isEnabled,
    disabled,
    onToggle,
}: NotificationsCardProps<Key>) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                    Choisissez quelles notifications vous souhaitez recevoir.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {items.map((item) => {
                    const checked = isEnabled(item.key);

                    return (
                        <div
                            key={item.key}
                            className="flex items-start justify-between gap-4 rounded-lg border border-border/60 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-medium">{item.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {item.description}
                                </div>
                            </div>
                            <Switch
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={() => {
                                    const promise = onToggle(item.key);
                                    toast.promise(promise, {
                                        loading: "Mise à jour…",
                                        success: (data) => data.message,
                                        error: (error) =>
                                            error instanceof Error
                                                ? error.message
                                                : "Impossible de mettre à jour ce paramètre de notification",
                                    });
                                }}
                            />
                        </div>
                    );
                })}

                <p className="text-xs text-muted-foreground">
                    Les changements sont appliqués immédiatement.
                </p>
            </CardContent>
        </Card>
    );
}
