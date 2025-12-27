import { createFileRoute, redirect } from "@tanstack/react-router";

import { parseOptionalInt } from "@/lib/parse";

import CodeNamesPage from "@/features/code-names/CodeNamesPage";
import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/games/code-names")({
    validateSearch: (search: Record<string, unknown>): { gameId?: number } => ({
        gameId: parseOptionalInt(search.gameId),
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
    component: CodeNamesRoute,
});

function CodeNamesRoute() {
    const { gameId } = Route.useSearch();
    return <CodeNamesPage gameId={gameId} />;
}
