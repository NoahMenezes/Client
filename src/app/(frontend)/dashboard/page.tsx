import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { LeadsTable } from '@/components/leads-table'
import React, { Suspense } from 'react'

export interface Lead {
  id: string | number
  leadId?: string | null
  fullName: string
  email: string
  phone?: string | null
  status: string
  checkInDate?: string | null
  checkOutDate?: string | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const payload = await getPayload({ config: configPromise })

  // Build search filter
  const where: Record<string, any> = q
    ? {
        or: [
          { fullName: { contains: q } },
          { email: { contains: q } },
          { leadId: { contains: q } },
        ],
      }
    : {}

  // Get counts and recent leads
  const [allResult, oppResult, prosResult, wonResult, recentLeads] = await Promise.all([
    payload.find({ collection: 'leads', limit: 0, overrideAccess: true }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'opportunity' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'prospect' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'won' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 10,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 0,
      where,
    }),
  ])

  const totalLeads = allResult.totalDocs
  const opportunityCount = oppResult.totalDocs
  const prospectCount = prosResult.totalDocs
  const wonCount = wonResult.totalDocs
  const leads = recentLeads.docs
  const totalDocs = recentLeads.totalDocs

  return (
    <>
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Dashboard" showSearch />
      </Suspense>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalLeads={totalLeads}
              opportunityCount={opportunityCount}
              prospectCount={prospectCount}
              wonCount={wonCount}
            />
            <div className="px-4 lg:px-6">
              <LeadsTable leads={leads as any} totalDocs={totalDocs} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
