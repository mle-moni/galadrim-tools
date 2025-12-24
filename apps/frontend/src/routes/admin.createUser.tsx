import { createFileRoute, redirect } from "@tanstack/react-router";

import { meQueryOptions } from "@/integrations/backend/auth";
import { hasRights } from "@/lib/rights";

export const Route = createFileRoute("/admin/createUser")({
    beforeLoad: async ({ context, location }) => {
        const me = await context.queryClient.ensureQueryData(meQueryOptions()).catch(() => {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        });

        if (!hasRights(me.rights, ["USER_ADMIN"])) {
            throw redirect({ to: "/admin", search: {} });
        }

        throw redirect({ to: "/admin", search: {} });
    },
    component: () => null,
});
