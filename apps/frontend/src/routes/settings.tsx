import { createFileRoute, redirect } from "@tanstack/react-router";

import SettingsPage from "@/features/settings/SettingsPage";
import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/settings")({
    beforeLoad: async ({ context, location }) => {
        try {
            await context.queryClient.ensureQueryData(meQueryOptions());
        } catch {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: SettingsRoute,
});

function SettingsRoute() {
    return <SettingsPage />;
}
