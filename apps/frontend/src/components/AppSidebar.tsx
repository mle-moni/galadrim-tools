import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Map as MapIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const isPlanningActive = pathname.startsWith("/planning");
    const isVisuelActive = pathname.startsWith("/visuel");

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">GalaTools</div>
                        <div className="truncate text-xs text-sidebar-foreground/70">
                            RoomPlanner
                        </div>
                    </div>
                    <SidebarTrigger className="hidden md:inline-flex" />
                </div>
                <Separator className="bg-sidebar-border" />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Pages</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isPlanningActive}
                                    tooltip="Planning"
                                >
                                    <Link to="/planning" search={{}}>
                                        <CalendarDays />
                                        <span>Planning</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isVisuelActive}
                                    tooltip="Visuel"
                                >
                                    <Link to="/visuel" search={{}}>
                                        <MapIcon />
                                        <span>Visuel</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
