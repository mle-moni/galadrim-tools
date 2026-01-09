import { isEditableElement } from "@/lib/dom";
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
import SeasonalSnowfall from "@/components/SeasonalSnowfall";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import DebugDevtools from "@/debug/devtools";

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
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/getOtp");

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
                <SeasonalSnowfall enabled={!isAuthRoute} />
                <Outlet />
                <Toaster position="top-center" />
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
                        DebugDevtools,
                    ]}
                />
            </>
        );
    }

    return (
        <>
            <SeasonalSnowfall enabled={!isAuthRoute} />
            <SidebarProvider defaultOpen className="h-svh min-h-0">
                <AppSidebar />
                <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
                    <Outlet />
                </SidebarInset>
                <Toaster position="top-center" />
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
                        DebugDevtools,
                    ]}
                />
            </SidebarProvider>
        </>
    );
}
