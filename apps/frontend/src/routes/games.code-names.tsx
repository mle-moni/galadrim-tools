import { createFileRoute, redirect } from "@tanstack/react-router";

import CodeNamesPage from "@/features/code-names/CodeNamesPage";
import { meQueryOptions } from "@/integrations/backend/auth";

function parseOptionalInt(value: unknown): number | undefined {
    if (value == null) return undefined;

    const text = String(value);
    if (!/^\d+$/.test(text)) return undefined;

    return +text;
}

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
