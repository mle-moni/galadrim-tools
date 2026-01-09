import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scheduler")({
    beforeLoad: () => {
        throw redirect({
            to: "/planning",
            search: {},
        });
    },
    component: () => null,
});
