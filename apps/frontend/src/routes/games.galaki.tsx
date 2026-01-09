import { createFileRoute, redirect } from "@tanstack/react-router";

import GalakiPage from "@/features/galaki/GalakiPage";
import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/games/galaki")({
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
    component: GalakiRoute,
});

function GalakiRoute() {
    return <GalakiPage />;
}
