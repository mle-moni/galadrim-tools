import { createFileRoute, redirect } from "@tanstack/react-router";

import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/miams")({
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
    return (
        <div className="flex h-full w-full flex-col gap-2 overflow-auto p-6">
            <h1 className="text-2xl font-semibold">Restaurants</h1>
            <p className="text-sm text-muted-foreground">Page en construction.</p>
        </div>
    );
}
