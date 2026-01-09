import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import type { UseMutationResult } from "@tanstack/react-query";

import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
    title: string;
    description: string;
    username: string;
    avatarSrc: string | null;
    logoutMutation: UseMutationResult<{ notification: string }, unknown, void, unknown>;
    onLogoutSuccessNotification: (data: { notification: string }) => string;
}

export default function SettingsHeader({
    title,
    description,
    username,
    avatarSrc,
    logoutMutation,
    onLogoutSuccessNotification,
}: SettingsHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <Avatar src={avatarSrc} alt={username} size={40} className="h-10 w-10" />
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="destructive"
                    onClick={() => {
                        toast.promise(logoutMutation.mutateAsync(), {
                            loading: "Déconnexion…",
                            success: onLogoutSuccessNotification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de se déconnecter",
                        });
                    }}
                    disabled={logoutMutation.isPending}
                >
                    {logoutMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                        "Se déconnecter"
                    )}
                </Button>
            </div>
        </div>
    );
}
