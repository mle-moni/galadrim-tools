import { createFileRoute, redirect } from "@tanstack/react-router";

import IdeasPage from "@/features/ideas/IdeasPage";
import { meQueryOptions } from "@/integrations/backend/auth";

function parseOptionalInt(value: unknown): number | undefined {
    if (value == null) return undefined;

    const text = String(value);
    if (!/^\d+$/.test(text)) return undefined;

    return +text;
}

export const Route = createFileRoute("/ideas")({
    validateSearch: (search: Record<string, unknown>): { ideaId?: number } => ({
        ideaId: parseOptionalInt(search.ideaId),
    }),
    beforeLoad: async ({ context, location }) => {
        try {
            await context.queryClient.ensureQueryData(meQueryOptions());
        } catch {
            throw redirect({
                to: "/login",
                search: { redirect: location.href },
            });
        }
    },
    component: IdeasRoute,
});

function IdeasRoute() {
    const { ideaId } = Route.useSearch();
    return <IdeasPage ideaId={ideaId} />;
}
