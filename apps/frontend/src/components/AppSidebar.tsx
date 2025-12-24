import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, LogOut, Settings, Utensils } from "lucide-react";

import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItemBase =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70";

export default function AppSidebar() {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isPlanningActive = pathname.startsWith("/planning");
    const isVisuelActive = pathname.startsWith("/visuel");

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
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 via-orange-300 to-emerald-500" />
                            <span className="text-sm font-medium">Damien</span>
                        </div>

                        <nav className="flex flex-col gap-1 px-4">
                            <Link
                                to="/planning"
                                search={{}}
                                aria-current={isPlanningActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isPlanningActive && "bg-slate-800/50 text-white"
                                )}
                            >
                                <CalendarDays className="h-4 w-4" />
                                <span className="flex-1">Salles de réunion</span>
                                <span className="text-xs font-medium text-slate-400">S</span>
                            </Link>

                            <Link
                                to="/visuel"
                                search={{}}
                                aria-current={isVisuelActive ? "page" : undefined}
                                className={cn(
                                    navItemBase,
                                    isVisuelActive && "bg-slate-800/50 text-white"
                                )}
                            >
                                <Utensils className="h-4 w-4" />
                                <span className="flex-1">Restaurants</span>
                                <span className="text-xs font-medium text-slate-400">R</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex flex-col gap-1 px-4 pb-6">
                        <button type="button" className={navItemBase}>
                            <Settings className="h-4 w-4" />
                            <span className="flex-1">Paramètres</span>
                        </button>
                        <button type="button" className={navItemBase}>
                            <LogOut className="h-4 w-4" />
                            <span className="flex-1">Se déconnecter</span>
                        </button>
                        <a
                            href="https://forest.galadrim.fr"
                            className={navItemBase}
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="flex-1">Retourner sur 🌳 Forest</span>
                        </a>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}
