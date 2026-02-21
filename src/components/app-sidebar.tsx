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
  IconHelp,
  IconLogout,
} from '@tabler/icons-react'
import Link from 'next/link'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { logout } from '@/app/actions/auth'

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
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/help"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <IconHelp className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <form action={logout} className="w-full">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <IconLogout className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </form>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
