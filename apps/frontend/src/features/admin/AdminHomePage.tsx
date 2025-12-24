import type { ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { BellPlus, LayoutDashboard, Map as MapIcon, Users } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import AdminCreateUserPage from "@/features/admin/AdminCreateUserPage";
import AdminDashboardSection from "@/features/admin/AdminDashboardSection";
import AdminNotificationsPage from "@/features/admin/AdminNotificationsPage";
import AdminOfficeRoomsEditor from "@/features/admin/AdminOfficeRoomsEditor";
import AdminUserRightsPage from "@/features/admin/AdminUserRightsPage";

import { meQueryOptions } from "@/integrations/backend/auth";
import { hasRights } from "@/lib/rights";

type IconComponent = (props: { className?: string }) => ReactNode;

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
    return (
        <details
            id={id}
            className="group rounded-lg border border-border/60 bg-muted/10 open:bg-muted/20"
            open
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
                    description="Créer et modifier les salles de réunion (EVENT_ADMIN)."
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
