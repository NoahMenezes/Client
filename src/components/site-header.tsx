'use client'

import { IconSearch, IconBell, IconUser } from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import React from 'react'

interface SiteHeaderProps {
  title?: string
  showSearch?: boolean
  children?: React.ReactNode
}

export function SiteHeader({ title = 'Dashboard', showSearch = false, children }: SiteHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    router.push(`/dashboard${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-white">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-xl font-bold">{title}</h1>

        {showSearch && (
          <form onSubmit={handleSearch} className="ml-4 flex items-center gap-2">
            <div className="relative w-64">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Leads"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>
        )}

        {children && <div className="ml-4 flex items-center gap-2">{children}</div>}

        {/* Right side: notification + avatar */}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <IconBell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2744] text-white text-xs font-bold hover:bg-[#243460] transition-colors"
            aria-label="User menu"
          >
            <IconUser className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
