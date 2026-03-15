'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AdvancedSearch } from '@/components/advanced-search'
import React from 'react'
import { ProfileBar } from '@/components/profile-bar'
import { useDashboardUser } from '@/context/user-context'

interface SiteHeaderProps {
  title?: string
  showSearch?: boolean
  children?: React.ReactNode
}

export function SiteHeader({ title = 'Dashboard', showSearch = false, children }: SiteHeaderProps) {
  const user = useDashboardUser()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-white">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-xl font-bold">{title}</h1>

        {showSearch && (
          <div className="ml-4 flex items-center gap-2">
            <AdvancedSearch />
          </div>
        )}

        {children && <div className="ml-4 flex items-center gap-2">{children}</div>}

        {/* Right side — real user profile bar */}
        <div className="ml-auto flex items-center">
          {user ? (
            <ProfileBar user={user} />
          ) : (
            <div className="h-8 w-32 rounded-full bg-gray-100 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  )
}
