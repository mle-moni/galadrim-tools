import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { INotification, IUserData } from "@galadrim-tools/shared";
import * as Dialog from "@radix-ui/react-dialog";
import {
    Bell,
    CalendarDays,
    ExternalLink,
    GitBranch,
    Puzzle,
    Lightbulb,
    LogOut,
    RefreshCcw,
    Settings,
    Shield,
    Sparkles,
    Utensils,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { ADMIN_TAB_RIGHTS, hasRights, hasSomeRights } from "@/lib/rights";

import Avatar from "@/components/Avatar";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { meQueryOptions } from "@/integrations/backend/auth";
import { logout, readNotifications } from "@/integrations/backend/settings";
import { queryKeys } from "@/integrations/backend/query-keys";
import { cn } from "@/lib/utils";

const navItemBase =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70 disabled:cursor-not-allowed disabled:opacity-50";

type NotificationTarget = { kind: "internal"; to: string } | { kind: "external"; href: string };

function resolveNotificationTarget(link: string | null | undefined): NotificationTarget | null {
    if (!link) return null;

    const trimmed = link.trim();
    if (trimmed === "") return null;

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return { kind: "external", href: trimmed };
    }

    if (trimmed.startsWith("/saveur")) {
        try {
            const url = new URL(trimmed, "https://galadrim.invalid");
            const params = url.searchParams;

            const restaurantId = params.get("restaurant-id") ?? params.get("restaurantId");
            if (restaurantId) {
                params.delete("restaurant-id");
                params.set("restaurantId", restaurantId);
            }

            const query = params.toString();
            return {
                kind: "internal",
                to: query ? `/miams?${query}` : "/miams",
            };
        } catch {
            return { kind: "internal", to: "/miams" };
        }
    }

    if (trimmed.startsWith("/office-rooms")) {
        return { kind: "internal", to: "/planning" };
    }

    if (trimmed.startsWith("/profile")) {
        return { kind: "internal", to: "/settings" };
    }

    if (trimmed.startsWith("/")) {
        return { kind: "internal", to: trimmed };
    }

    return null;
}

function NotificationListItem({
    notification,
    onClose,
    onNavigate,
}: {
    notification: INotification;
    onClose: () => void;
    onNavigate: (target: NotificationTarget) => void;
}) {
    const target = resolveNotificationTarget(notification.link);

    const sharedClassName = cn(
        "rounded-md border px-3 py-2 text-left transition-colors",
        notification.read ? "border-slate-800 bg-slate-900/20" : "border-slate-700 bg-slate-900/40",
        target &&
            "hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70",
    );

    const content = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{notification.title}</div>
                    <div className="mt-0.5 whitespace-pre-wrap text-sm text-white/80">
                        {notification.text}
                    </div>
                </div>
                <div className="shrink-0 text-xs text-white/60">
                    {format(new Date(notification.createdAt), "P", { locale: fr })}
                </div>
            </div>

            {target?.kind === "external" && (
                <div className="mt-2 flex items-center gap-1 text-xs text-white/60">
                    <ExternalLink className="h-3 w-3" />
                    <span>Ouvrir le lien</span>
                </div>
            )}
        </>
    );

    if (!target) {
        return <div className={sharedClassName}>{content}</div>;
    }

    return (
        <button
            type="button"
            className={sharedClassName}
            onClick={() => {
                onClose();
                onNavigate(target);
            }}
        >
            {content}
        </button>
    );
}

// prevents sidebar shortcuts from hijacking typing in inputs
function isEditableElement(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
    );
}

export default function AppSidebar() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { isMobile, open, openMobile } = useSidebar();
    const isSidebarVisible = isMobile ? openMobile : open;

    const meQuery = useQuery(meQueryOptions());
    const username = meQuery.data?.username ?? "Moi";
    const avatarUrl = meQuery.data?.imageUrl ?? null;

    const notifications = useMemo<INotification[]>(() => {
        const list = meQuery.data?.notifications ?? [];
        return list
            .slice()
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    }, [meQuery.data?.notifications]);

    const unreadCount = useMemo(() => {
        return notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);
    }, [notifications]);

    const readNotificationsMutation = useMutation<
        { message: string },
        Error,
        void,
        { previous?: IUserData }
    >({
        mutationFn: async () => readNotifications(),
        onMutate: async () => {
            await queryClient.cancelQueries({
                queryKey: queryKeys.me(),
                exact: true,
            });
            const previous = queryClient.getQueryData<IUserData>(queryKeys.me());
            queryClient.setQueryData<IUserData>(queryKeys.me(), (old) => {
                if (!old) return old;
                return {
                    ...old,
                    notifications: old.notifications.map((n) => ({
                        ...n,
                        read: true,
                    })),
                };
            });
            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (!context?.previous) return;
            queryClient.setQueryData<IUserData>(queryKeys.me(), context.previous);
        },
    });

    const userRights = meQuery.data?.rights ?? 0;
    const canSeeAdmin = hasSomeRights(userRights, ADMIN_TAB_RIGHTS);
    const canSeeCodeNames = hasRights(userRights, ["CODE_NAMES_ADMIN"]);

    const isPlanningActive = pathname.startsWith("/planning");
    const isIdeasActive = pathname.startsWith("/ideas");
    const isMiamsActive = pathname.startsWith("/miams");
    const isGalakiActive = pathname.startsWith("/games/galaki");
    const isCodeNamesActive = pathname.startsWith("/games/code-names");
    const isSettingsActive = pathname.startsWith("/settings");
    const isAdminActive = pathname.startsWith("/admin");

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

    const navigateTo = useMemo(() => {
        return (to: string) => router.history.push(to);
    }, [router.history]);

    useEffect(() => {
        if (!isSidebarVisible) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.defaultPrevented) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            if (isEditableElement(e.target) || isEditableElement(document.activeElement)) return;

            const key = e.key.toLowerCase();
            if (key === "s") {
                e.preventDefault();
                navigateTo("/planning");
            }

            if (key === "i") {
                e.preventDefault();
                navigateTo("/ideas");
            }

            if (key === "r") {
                e.preventDefault();
                navigateTo("/miams");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isSidebarVisible, navigateTo]);

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
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                {username}
                            </span>

                            <Dialog.Root
                                open={notificationsOpen}
                                onOpenChange={(next) => {
                                    setNotificationsOpen(next);
                                    if (!next) return;
                                    if (unreadCount === 0) return;
                                    readNotificationsMutation.mutate();
                                }}
                            >
                                <Dialog.Trigger asChild>
                                    <button
                                        type="button"
                                        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70"
                                    >
                                        <Bell className="h-4 w-4" />
                                        <span className="sr-only">Ouvrir les notifications</span>
                                        {unreadCount > 0 ? (
                                            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        ) : null}
                                    </button>
                                </Dialog.Trigger>

                                <Dialog.Portal>
                                    <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" />
                                    <Dialog.Content className="fixed left-1/2 top-1/2 z-[100] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-700 bg-black p-4 text-white shadow-xl">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <Dialog.Title className="text-base font-semibold">
                                                    Notifications
                                                </Dialog.Title>
                                            </div>

                                            <Dialog.Close asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70"
                                                >
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Fermer</span>
                                                </button>
                                            </Dialog.Close>
                                        </div>

                                        <div className="mt-4 max-h-[60vh] overflow-auto">
                                            {notifications.length === 0 ? (
                                                <div className="text-sm text-white/70">
                                                    Aucune notification.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    {notifications.map((notification) => (
                                                        <NotificationListItem
                                                            key={notification.id}
                                                            notification={notification}
                                                            onClose={() =>
                                                                setNotificationsOpen(false)
                                                            }
                                                            onNavigate={(target) => {
                                                                if (target.kind === "external") {
                                                                    window.open(
                                                                        target.href,
                                                                        "_blank",
                                                                        "noopener,noreferrer",
                                                                    );
                                                                    return;
                                                                }

                                                                router.history.push(target.to);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
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
                                to="/ideas"
                                search={{}}
                                aria-current={isIdeasActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isIdeasActive && "bg-slate-800/50 text-white",
                                )}
                            >
                                <Lightbulb className="h-4 w-4" />
                                <span className="flex-1">Boîte à idées</span>
                                <span className="text-xs font-medium text-slate-400">I</span>
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

                            <Link
                                to="/games/galaki"
                                search={{}}
                                aria-current={isGalakiActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isGalakiActive && "bg-slate-800/50 text-white",
                                )}
                            >
                                <Sparkles className="h-4 w-4" />
                                <span className="flex-1">Galaki</span>
                            </Link>

                            {canSeeCodeNames && (
                                <Link
                                    to="/games/code-names"
                                    search={{}}
                                    aria-current={isCodeNamesActive ? "page" : undefined}
                                    className={cn(
                                        navItemBase,
                                        isCodeNamesActive && "bg-slate-800/50 text-white",
                                    )}
                                >
                                    <Puzzle className="h-4 w-4" />
                                    <span className="flex-1">Code Names</span>
                                </Link>
                            )}

                            {canSeeAdmin && (
                                <Link
                                    to="/admin"
                                    search={{}}
                                    aria-current={isAdminActive ? "page" : undefined}
                                    className={cn(
                                        navItemBase,
                                        isAdminActive && "bg-slate-800/50 text-white",
                                    )}
                                >
                                    <Shield className="h-4 w-4" />
                                    <span className="flex-1">Administration</span>
                                </Link>
                            )}
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
                        <a
                            href="https://github.com/mle-moni/galadrim-tools"
                            target="_blank"
                            rel="noreferrer"
                            className={navItemBase}
                        >
                            <GitBranch className="h-4 w-4" />
                            <span className="flex-1">Contribuer</span>
                        </a>
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
