import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import type { QueryClient } from '@tanstack/react-query'

import AppSidebar from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <Outlet />
      </SidebarInset>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </SidebarProvider>
  )
}
