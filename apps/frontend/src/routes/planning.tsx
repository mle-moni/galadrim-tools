import { createFileRoute, redirect } from "@tanstack/react-router";

import SchedulerPage from "@/features/scheduler/SchedulerPage";
import { meQueryOptions } from "@/integrations/backend/auth";
import { parseOptionalNumber } from "@galadrim-tools/shared";

export const Route = createFileRoute("/planning")({
    validateSearch: (
        search: Record<string, unknown>,
    ): { officeId?: number; floorId?: number; roomId?: number } => ({
        officeId: parseOptionalNumber(search.officeId),
        floorId: parseOptionalNumber(search.floorId),
        roomId: parseOptionalNumber(search.roomId),
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
    component: PlanningRoute,
});

function PlanningRoute() {
    const { officeId, floorId, roomId } = Route.useSearch();

    return (
        <SchedulerPage initialOfficeId={officeId} initialFloorId={floorId} focusedRoomId={roomId} />
    );
}
