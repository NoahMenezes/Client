'use client'

import * as React from 'react'
import {
  IconDashboard,
  IconFolder,
  IconListDetails,
  IconSettings,
  IconUsers,
  IconFileInvoice,
  IconCalendar,
} from '@tabler/icons-react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  navMain: [
    { title: 'Dashboard', url: '/dashboard', icon: IconDashboard },
    { title: 'Leads', url: '/dashboard/leads', icon: IconListDetails },
    { title: 'Quotations', url: '/dashboard/quotations', icon: IconFileInvoice },
    { title: 'Calendar', url: '/dashboard/calendar', icon: IconCalendar },
    { title: 'Employees', url: '/dashboard/employees', icon: IconUsers },
    { title: 'Storage', url: '/dashboard/storage', icon: IconFolder },
  ],
  navSecondary: [{ title: 'Settings', url: '/dashboard/settings', icon: IconSettings }],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  PK
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Perfect Knot</span>
                  <span className="text-xs text-muted-foreground">CRM</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
