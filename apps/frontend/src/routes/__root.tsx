import { useEffect, useRef } from "react";
import {
    Outlet,
    createRootRouteWithContext,
    useRouter,
    useRouterState,
} from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import type { QueryClient } from "@tanstack/react-query";

import AppSidebar from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";

import { unlockPlatformerEasterEgg } from "@/features/platformer/easter-egg";
import { createKeySequenceMatcher, KONAMI_SEQUENCE } from "@/lib/konami";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
});

function RootComponent() {
    const router = useRouter();
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const href = useRouterState({ select: (s) => s.location.href });
    const isAuthRoute = pathname.startsWith("/login");

    const hrefRef = useRef(href);
    const pathnameRef = useRef(pathname);

    useEffect(() => {
        hrefRef.current = href;
    }, [href]);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        if (isAuthRoute) return;

        const matcher = createKeySequenceMatcher(KONAMI_SEQUENCE);

        const isEditableElement = (target: EventTarget | null) => {
            if (!(target instanceof HTMLElement)) return false;
            return (
                target.isContentEditable ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            );
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            if (pathnameRef.current.startsWith("/platformer")) return;

            if (isEditableElement(e.target) || isEditableElement(document.activeElement)) return;

            if (matcher.feed(e.key)) {
                unlockPlatformerEasterEgg(hrefRef.current);
                router.history.push("/platformer");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isAuthRoute, router.history]);

    if (isAuthRoute) {
        return (
            <>
                <Outlet />
                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
            </>
        );
    }

    return (
        <SidebarProvider defaultOpen className="h-svh min-h-0">
            <AppSidebar />
            <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
                <Outlet />
            </SidebarInset>
            <TanStackDevtools
                config={{
                    position: "bottom-right",
                }}
                plugins={[
                    {
                        name: "Tanstack Router",
                        render: <TanStackRouterDevtoolsPanel />,
                    },
                    TanStackQueryDevtools,
                ]}
            />
        </SidebarProvider>
    );
}
