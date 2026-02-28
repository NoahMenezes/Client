import React from 'react'
import type { Metadata } from 'next'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard – Perfect Knot CRM',
  description: 'Manage leads, employees, and operations.',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ── Auth gate — redirect to login if not authenticated ──
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (!user) redirect('/login')
  } catch {
    // Auth check failed (no DB, bad token, etc.) — deny access
    redirect('/login')
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 64)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
