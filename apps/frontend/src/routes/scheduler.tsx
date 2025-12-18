import { createFileRoute, redirect } from "@tanstack/react-router";

import SchedulerPage from "@/features/scheduler/SchedulerPage";
import { meQueryOptions } from "@/integrations/backend/auth";

export const Route = createFileRoute("/scheduler")({
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
    component: SchedulerPage,
});
