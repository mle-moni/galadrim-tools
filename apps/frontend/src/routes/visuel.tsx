import { createFileRoute, redirect } from "@tanstack/react-router";

import VisuelPage from "@/features/visuel/VisuelPage";
import { meQueryOptions } from "@/integrations/backend/auth";

function parseOptionalNumber(value: unknown): number | undefined {
    if (value == null) return undefined;
    return Number(value);
}

export const Route = createFileRoute("/visuel")({
    validateSearch: (search: Record<string, unknown>): { officeId?: number; floorId?: number } => ({
        officeId: parseOptionalNumber(search.officeId),
        floorId: parseOptionalNumber(search.floorId),
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
    component: VisuelRoute,
});

function VisuelRoute() {
    const { officeId, floorId } = Route.useSearch();

    return <VisuelPage initialOfficeId={officeId} initialFloorId={floorId} />;
}
