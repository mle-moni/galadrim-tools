import { useEffect, useState, type ReactNode } from "react";

import { readStoredBoolean } from "@galadrim-tools/shared";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    BellPlus,
    LayoutDashboard,
    Map as MapIcon,
    RefreshCcw,
    Sparkles,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import AdminCreateUserPage from "@/features/admin/AdminCreateUserPage";
import AdminDashboardSection from "@/features/admin/AdminDashboardSection";
import AdminNotificationsPage from "@/features/admin/AdminNotificationsPage";
import AdminOfficeRoomsEditor from "@/features/admin/AdminOfficeRoomsEditor";
import AdminUserRightsPage from "@/features/admin/AdminUserRightsPage";

import { meQueryOptions } from "@/integrations/backend/auth";
import { refreshPortraitGuessGame } from "@/integrations/backend/portraitGuessGame";
import { hasRights } from "@/lib/rights";

type IconComponent = (props: { className?: string }) => ReactNode;

const ADMIN_SECTION_STORAGE_PREFIX = "galadrim.admin.accordion";

function getAdminSectionStorageKey(id: string) {
    return `${ADMIN_SECTION_STORAGE_PREFIX}.${id}.open`;
}

function writeStoredBoolean(key: string, value: boolean) {
    window.localStorage.setItem(key, value ? "1" : "0");
}

function Section({
    title,
    description,
    icon: Icon,
    children,
    id,
}: {
    id: string;
    title: string;
    description: string;
    icon: IconComponent;
    children: ReactNode;
}) {
    const storageKey = getAdminSectionStorageKey(id);
    const [open, setOpen] = useState(() => readStoredBoolean(storageKey) ?? true);

    useEffect(() => {
        writeStoredBoolean(storageKey, open);
    }, [open, storageKey]);

    return (
        <details
            id={id}
            className="group rounded-lg border border-border/60 bg-muted/10 open:bg-muted/20"
            open={open}
            onToggle={(e) => {
                setOpen(e.currentTarget.open);
            }}
        >
            <summary className="flex cursor-pointer items-start gap-3 px-4 py-3 select-none">
                <Icon className="mt-0.5 h-4 w-4" />
                <div className="min-w-0">
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                </div>
            </summary>
            <div className="px-4 pb-4">{children}</div>
        </details>
    );
}

function AdminGalakiRefreshCard() {
    const refreshMutation = useMutation({
        mutationFn: refreshPortraitGuessGame,
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Portraits (refresh)</CardTitle>
                <CardDescription>
                    Normalement rafraîchi via cron. Déclenche une resynchronisation manuelle depuis
                    la source.
                </CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
                <Button
                    variant="outline"
                    onClick={() => {
                        const promise = refreshMutation.mutateAsync();
                        toast.promise(promise, {
                            loading: "Rafraîchissement Galaki…",
                            success: (data) => data.message ?? "OK",
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de rafraîchir Galaki",
                        });
                    }}
                    disabled={refreshMutation.isPending}
                >
                    {refreshMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : null}
                    Rafraîchir
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function AdminHomePage() {
    const meQuery = useQuery(meQueryOptions());
    const userRights = meQuery.data?.rights ?? 0;

    const canCreateUser = hasRights(userRights, ["USER_ADMIN"]);
    const canEditRights = hasRights(userRights, ["RIGHTS_ADMIN"]);
    const canEditMap = hasRights(userRights, ["EVENT_ADMIN"]);
    const canSeeDashboard = hasRights(userRights, ["DASHBOARD_ADMIN"]);
    const canSendNotifications = hasRights(userRights, ["NOTIFICATION_ADMIN"]);

    const canManageUsers = canCreateUser || canEditRights;
    const hasAnyTool = canManageUsers || canEditMap || canSeeDashboard || canSendNotifications;

    return (
        <div className="flex flex-col gap-6">
            {canSeeDashboard && (
                <Section
                    id="galaki"
                    title="Galaki"
                    description="Rafraîchir les portraits."
                    icon={Sparkles}
                >
                    <AdminGalakiRefreshCard />
                </Section>
            )}

            {canManageUsers && (
                <Section
                    id="manage-users"
                    title="Gérer les utilisateurs"
                    description="Créer des utilisateurs et gérer leurs droits."
                    icon={Users}
                >
                    <div className="grid items-start gap-4 md:grid-cols-2">
                        {canCreateUser && <AdminCreateUserPage />}
                        {canEditRights && <AdminUserRightsPage />}
                    </div>
                </Section>
            )}

            {canEditMap && (
                <Section
                    id="map-editor"
                    title="Éditeur de plan"
                    description="Créer et modifier les salles de réunion."
                    icon={MapIcon}
                >
                    <AdminOfficeRoomsEditor />
                </Section>
            )}

            {canSeeDashboard && (
                <Section
                    id="dashboard"
                    title="Dashboard"
                    description="Métriques serveur: mémoire, load average, uptime."
                    icon={LayoutDashboard}
                >
                    <AdminDashboardSection />
                </Section>
            )}

            {canSendNotifications && (
                <Section
                    id="notifications"
                    title="Notifications"
                    description="Envoyer une notification à un ou plusieurs utilisateurs."
                    icon={BellPlus}
                >
                    <AdminNotificationsPage />
                </Section>
            )}

            {!hasAnyTool && (
                <Card>
                    <CardHeader>
                        <CardTitle>Administration</CardTitle>
                        <CardDescription>
                            Votre compte n'a pas accès à des outils d'administration.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
