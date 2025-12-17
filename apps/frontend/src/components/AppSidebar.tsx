import { Link, useRouterState } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
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
} from '@/components/ui/sidebar'

export default function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isSchedulerActive = pathname.startsWith('/scheduler')

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
                  isActive={isSchedulerActive}
                  tooltip="Planning"
                >
                  <Link to="/scheduler">
                    <CalendarDays />
                    <span>Planning</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
