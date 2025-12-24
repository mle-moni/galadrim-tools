import { useEffect } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, LogOut, RefreshCcw, Settings, Utensils } from "lucide-react";
import { toast } from "sonner";

import Avatar from "@/components/Avatar";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { meQueryOptions } from "@/integrations/backend/auth";
import { logout } from "@/integrations/backend/settings";
import { queryKeys } from "@/integrations/backend/query-keys";
import { cn } from "@/lib/utils";

const navItemBase =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70 disabled:cursor-not-allowed disabled:opacity-50";

export default function AppSidebar() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { isMobile, open, openMobile } = useSidebar();
    const isSidebarVisible = isMobile ? openMobile : open;

    const meQuery = useQuery(meQueryOptions());
    const username = meQuery.data?.username ?? "Moi";
    const avatarUrl = meQuery.data?.imageUrl ?? null;

    const isPlanningActive = pathname.startsWith("/planning");
    const isMiamsActive = pathname.startsWith("/miams");
    const isSettingsActive = pathname.startsWith("/settings");

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            queryClient.removeQueries({ queryKey: queryKeys.me(), exact: true });
            await router.invalidate();
            router.history.push("/login");
        },
        onError: async () => {
            queryClient.removeQueries({ queryKey: queryKeys.me(), exact: true });
            await router.invalidate();
            router.history.push("/login");
        },
    });

    useEffect(() => {
        if (!isSidebarVisible) return;

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

            if (isEditableElement(e.target) || isEditableElement(document.activeElement)) return;

            const key = e.key.toLowerCase();
            if (key === "s") {
                e.preventDefault();
                router.history.push("/planning");
            }

            if (key === "r") {
                e.preventDefault();
                router.history.push("/miams");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isSidebarVisible, router.history]);

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <div className="relative flex h-full w-full flex-col overflow-hidden border-r border-slate-700 bg-black text-white">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-20 -top-28 h-72 w-80 opacity-20"
                    style={{
                        backgroundImage:
                            "repeating-radial-gradient(circle at 30% 30%, rgba(241,245,249,0.2) 0, rgba(241,245,249,0.2) 1px, transparent 1px, transparent 12px)",
                    }}
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-40 right-0 h-80 w-96 opacity-20"
                    style={{
                        backgroundImage:
                            "repeating-radial-gradient(circle at 70% 70%, rgba(241,245,249,0.2) 0, rgba(241,245,249,0.2) 1px, transparent 1px, transparent 12px)",
                    }}
                />

                <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex flex-col gap-6 pt-8">
                        <div className="px-6">
                            <div className="text-[22px] font-semibold leading-none tracking-tight">
                                galadrim.
                            </div>
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
                                Tools
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4">
                            <Avatar src={avatarUrl} alt={username} size={24} className="h-6 w-6" />
                            <span className="text-sm font-medium">{username}</span>
                        </div>

                        <nav className="flex flex-col gap-1 px-4">
                            <Link
                                to="/planning"
                                search={{}}
                                aria-current={isPlanningActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isPlanningActive && "bg-slate-800/50 text-white",
                                )}
                            >
                                <CalendarDays className="h-4 w-4" />
                                <span className="flex-1">Salles de réunion</span>
                                <span className="text-xs font-medium text-slate-400">S</span>
                            </Link>

                            <Link
                                to="/miams"
                                search={{}}
                                aria-current={isMiamsActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isMiamsActive && "bg-slate-800/50 text-white",
                                )}
                            >
                                <Utensils className="h-4 w-4" />
                                <span className="flex-1">Restaurants</span>
                                <span className="text-xs font-medium text-slate-400">R</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex flex-col gap-1 px-4 pb-6">
                        <Link
                            to="/settings"
                            search={{}}
                            aria-current={isSettingsActive ? "page" : undefined}
                            className={cn(
                                navItemBase,
                                isSettingsActive && "bg-slate-800/50 text-white",
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            <span className="flex-1">Paramètres</span>
                        </Link>
                        <button
                            type="button"
                            className={navItemBase}
                            onClick={() => {
                                const promise = logoutMutation.mutateAsync();
                                toast.promise(promise, {
                                    loading: "Déconnexion…",
                                    success: (data) => data.notification,
                                    error: (error) =>
                                        error instanceof Error
                                            ? error.message
                                            : "Impossible de se déconnecter",
                                });
                            }}
                            disabled={logoutMutation.isPending}
                        >
                            {logoutMutation.isPending ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            <span className="flex-1">
                                {logoutMutation.isPending ? "" : "Se déconnecter"}
                            </span>
                        </button>
                        <a href="https://forest.galadrim.fr" className={navItemBase}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="flex-1">Retourner sur 🌳 Forest</span>
                        </a>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
