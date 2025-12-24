import { createFileRoute, redirect } from "@tanstack/react-router";

import AdminHomePage from "@/features/admin/AdminHomePage";
import AdminShell from "@/features/admin/AdminShell";

import { ADMIN_TAB_RIGHTS, hasSomeRights } from "@/lib/rights";

import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/admin")({
    beforeLoad: async ({ context, location }) => {
        const me = await context.queryClient.ensureQueryData(meQueryOptions()).catch(() => {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        });

        if (!hasSomeRights(me.rights, ADMIN_TAB_RIGHTS)) {
            throw redirect({
                to: "/planning",
                search: {},
            });
        }
    },
    component: AdminRoute,
});

function AdminRoute() {
    return (
        <AdminShell
            title="Administration"
            description="Outils internes réservés aux admins (selon vos droits)."
            backTo="/planning"
        >
            <AdminHomePage />
        </AdminShell>
    );
}
