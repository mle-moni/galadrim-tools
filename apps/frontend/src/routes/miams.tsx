import { createFileRoute, redirect } from "@tanstack/react-router";

import MiamsPage from "@/features/miams/MiamsPage";
import { meQueryOptions } from "@/integrations/backend/auth";
import { parseOptionalInt } from "@/lib/parse";

export const Route = createFileRoute("/miams")({
    validateSearch: (
        search: Record<string, unknown>,
    ): { restaurantId?: number; zoom?: number } => ({
        restaurantId: parseOptionalInt(search.restaurantId),
        zoom: parseOptionalInt(search.zoom),
    }),
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
    component: MiamsRoute,
});

function MiamsRoute() {
    const { restaurantId, zoom } = Route.useSearch();
    return <MiamsPage selectedRestaurantId={restaurantId} zoom={zoom} />;
}
